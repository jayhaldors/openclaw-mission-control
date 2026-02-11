# Configuration

This page documents how Mission Control is configured across local dev, self-host, and production.

## Config sources (first pass)

- Docker Compose uses `compose.yml` plus environment variables.
- Backend reads env vars (see `backend/app/core/config.py`).
- Frontend uses Next.js env vars at build/runtime (see `frontend/` plus `compose.yml`).

## Key environment variables

### Frontend
- `NEXT_PUBLIC_API_URL` — backend base URL reachable from the browser
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — enables Clerk in the frontend when set

### Backend
- `DATABASE_URL` — Postgres connection string
- `CORS_ORIGINS` — comma-separated allowed origins
- `CLERK_JWKS_URL` — enables Clerk JWT verification on protected routes
- `DB_AUTO_MIGRATE` — whether to auto-run migrations on startup (see backend docs/config)

## Secrets handling
- Do not commit secret keys.
- Prefer `.env` files that are excluded by `.gitignore`.

## Links
- Deployment notes: [docs/deployment/README.md](deployment/README.md)
- Production notes: [docs/production/README.md](production/README.md)
