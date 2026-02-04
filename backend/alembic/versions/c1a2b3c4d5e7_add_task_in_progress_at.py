"""add task in_progress_at

Revision ID: c1a2b3c4d5e7
Revises: b9d22e2a4d50
Create Date: 2026-02-04 13:34:25.000000

"""
from __future__ import annotations

from alembic import op


# revision identifiers, used by Alembic.
revision = "c1a2b3c4d5e7"
down_revision = "b9d22e2a4d50"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS in_progress_at TIMESTAMP WITHOUT TIME ZONE"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_tasks_in_progress_at ON tasks (in_progress_at)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_tasks_in_progress_at")
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS in_progress_at")
