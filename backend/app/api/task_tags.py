"""Task-tag CRUD endpoints for organization-scoped task categorization."""

from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlmodel import col, select

from app.api.deps import require_org_admin, require_org_member
from app.core.time import utcnow
from app.db import crud
from app.db.pagination import paginate
from app.db.session import get_session
from app.models.task_tag_assignments import TaskTagAssignment
from app.models.task_tags import TaskTag
from app.schemas.common import OkResponse
from app.schemas.pagination import DefaultLimitOffsetPage
from app.schemas.task_tags import TaskTagCreate, TaskTagRead, TaskTagUpdate
from app.services.organizations import OrganizationContext
from app.services.task_tags import slugify_task_tag, task_counts_for_tags

if TYPE_CHECKING:
    from collections.abc import Sequence

    from fastapi_pagination.limit_offset import LimitOffsetPage
    from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(prefix="/tags", tags=["tags"])
SESSION_DEP = Depends(get_session)
ORG_MEMBER_DEP = Depends(require_org_member)
ORG_ADMIN_DEP = Depends(require_org_admin)


def _normalize_slug(slug: str | None, *, fallback_name: str) -> str:
    source = (slug or "").strip() or fallback_name
    return slugify_task_tag(source)


async def _require_org_task_tag(
    session: AsyncSession,
    *,
    tag_id: UUID,
    ctx: OrganizationContext,
) -> TaskTag:
    tag = await TaskTag.objects.by_id(tag_id).first(session)
    if tag is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if tag.organization_id != ctx.organization.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return tag


async def _ensure_slug_available(
    session: AsyncSession,
    *,
    organization_id: UUID,
    slug: str,
    exclude_tag_id: UUID | None = None,
) -> None:
    existing = await TaskTag.objects.filter_by(organization_id=organization_id, slug=slug).first(
        session
    )
    if existing is None:
        return
    if exclude_tag_id is not None and existing.id == exclude_tag_id:
        return
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Task tag slug already exists in this organization.",
    )


async def _tag_read_page(
    *,
    session: AsyncSession,
    items: Sequence[TaskTag],
) -> list[TaskTagRead]:
    if not items:
        return []
    counts = await task_counts_for_tags(
        session,
        tag_ids=[item.id for item in items],
    )
    return [
        TaskTagRead.model_validate(item, from_attributes=True).model_copy(
            update={"task_count": counts.get(item.id, 0)},
        )
        for item in items
    ]


@router.get("", response_model=DefaultLimitOffsetPage[TaskTagRead])
async def list_task_tags(
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_MEMBER_DEP,
) -> LimitOffsetPage[TaskTagRead]:
    """List task tags for the active organization."""
    statement = (
        select(TaskTag)
        .where(col(TaskTag.organization_id) == ctx.organization.id)
        .order_by(func.lower(col(TaskTag.name)).asc(), col(TaskTag.created_at).asc())
    )

    async def _transform(items: Sequence[object]) -> Sequence[object]:
        tags: list[TaskTag] = []
        for item in items:
            if not isinstance(item, TaskTag):
                msg = "Expected TaskTag items from paginated query"
                raise TypeError(msg)
            tags.append(item)
        return await _tag_read_page(session=session, items=tags)

    return await paginate(session, statement, transformer=_transform)


@router.post("", response_model=TaskTagRead)
async def create_task_tag(
    payload: TaskTagCreate,
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> TaskTagRead:
    """Create a task tag within the active organization."""
    slug = _normalize_slug(payload.slug, fallback_name=payload.name)
    await _ensure_slug_available(
        session,
        organization_id=ctx.organization.id,
        slug=slug,
    )
    tag = await crud.create(
        session,
        TaskTag,
        organization_id=ctx.organization.id,
        name=payload.name,
        slug=slug,
        color=payload.color,
        description=payload.description,
    )
    return TaskTagRead.model_validate(tag, from_attributes=True)


@router.get("/{tag_id}", response_model=TaskTagRead)
async def get_task_tag(
    tag_id: UUID,
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_MEMBER_DEP,
) -> TaskTagRead:
    """Get a single task tag in the active organization."""
    tag = await _require_org_task_tag(
        session,
        tag_id=tag_id,
        ctx=ctx,
    )
    count = (
        await session.exec(
            select(func.count(col(TaskTagAssignment.task_id))).where(
                col(TaskTagAssignment.tag_id) == tag.id,
            ),
        )
    ).one()
    return TaskTagRead.model_validate(tag, from_attributes=True).model_copy(
        update={"task_count": int(count or 0)},
    )


@router.patch("/{tag_id}", response_model=TaskTagRead)
async def update_task_tag(
    tag_id: UUID,
    payload: TaskTagUpdate,
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> TaskTagRead:
    """Update a task tag in the active organization."""
    tag = await _require_org_task_tag(
        session,
        tag_id=tag_id,
        ctx=ctx,
    )
    updates = payload.model_dump(exclude_unset=True)

    if "slug" in payload.model_fields_set:
        updates["slug"] = _normalize_slug(
            updates.get("slug"),
            fallback_name=str(updates.get("name") or tag.name),
        )
    if "slug" in updates and isinstance(updates["slug"], str):
        await _ensure_slug_available(
            session,
            organization_id=ctx.organization.id,
            slug=updates["slug"],
            exclude_tag_id=tag.id,
        )
    updates["updated_at"] = utcnow()
    updated = await crud.patch(session, tag, updates)
    return TaskTagRead.model_validate(updated, from_attributes=True)


@router.delete("/{tag_id}", response_model=OkResponse)
async def delete_task_tag(
    tag_id: UUID,
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> OkResponse:
    """Delete a task tag and remove all associated task-tag links."""
    tag = await _require_org_task_tag(
        session,
        tag_id=tag_id,
        ctx=ctx,
    )
    await crud.delete_where(
        session,
        TaskTagAssignment,
        col(TaskTagAssignment.tag_id) == tag.id,
        commit=False,
    )
    await session.delete(tag)
    await session.commit()
    return OkResponse()
