# Methodist Church Ghana — Church Management System

A public church website and a secure church management portal for a single Methodist
Church/Society in Ghana, built as a monorepo.

> **Status:** Phases 1–5 (auth, users/roles/permissions, members/families/visitors,
> attendance, ministries/groups/leadership), Phase 10 (finance), and Phase 8's CMS
> settings screen are complete, tested, and have full admin UI. **Events, Sermons
> and News now also have full admin management** (`/admin/events`, `/admin/sermons`,
> `/admin/news`) — staff can create, edit, publish/unpublish and delete content,
> which immediately reflects on the public site. Prayer requests and contact form
> submissions have full backend CRUD/permissions but no admin UI page yet. Media/
> gallery upload, announcements, and a generic follow-up/task system are not built.
> See [`docs/architecture.md`](docs/architecture.md) for the full roadmap and
> known gaps.

## Overview

- **Public website** — informational church site (homepage, ministries, sermons,
  events, news, giving, contact). Placeholder content today; comes online in Phase 8.
- **Management portal** (`/admin`) — staff-only app for members, attendance, finance,
  events, media and reporting, gated by role-based permissions.
- **API** — a NestJS REST API (`/api/v1/...`) shared by both.
- **Database** — PostgreSQL via Prisma.

This is **not** a multi-tenant SaaS product — it is scoped to one church, though the
architecture stays clean enough to extend later if needed.

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn-style components, React Hook Form, Zod, TanStack Query, Recharts |
| Backend  | NestJS, TypeScript, Prisma ORM, JWT auth, class-validator, Swagger |
| Database | PostgreSQL |
| Auth     | JWT access tokens (in-memory on the client) + httpOnly refresh-token cookie, bcrypt password hashing, RBAC with granular permissions |

## Project structure

```
apps/
  web/        Next.js app (public site + /admin portal)
  api/        NestJS REST API
database/     Prisma schema, migrations, seed script (shared by the API)
docs/         Architecture, security, roles & permissions, etc.
docker-compose.yml   Local PostgreSQL for development
```

## Prerequisites

- Node.js 20+
- Docker Desktop (for local PostgreSQL) — or point `DATABASE_URL` at any Postgres
  instance (e.g. Neon, Supabase) if you'd rather not run Docker locally
- npm (this repo uses npm workspaces)

## Getting started

1. **Install dependencies** (installs all workspaces from the root):

   ```bash
   npm install
   ```

2. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   The defaults work out of the box with the bundled `docker-compose.yml`. See
   [Environment variables](#environment-variables) below for what each one does.

   > **Note:** the local Postgres container is published on host port **5433**, not
   > 5432 — this avoids clashing with any native PostgreSQL install already running
   > on your machine. If you use your own Postgres instance instead, update
   > `DATABASE_URL`/`DIRECT_URL` accordingly.

3. **Start PostgreSQL**:

   ```bash
   npm run docker:up
   ```

4. **Run migrations and seed development data**:

   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

   The seed script prints five development logins (Super Admin, Minister, Secretary,
   Treasurer, Media Officer) — all fake credentials, see
   [Admin account setup](#admin-account-setup--seeded-users).

5. **Run the app** (two terminals, or two `npm run` calls in the background):

   ```bash
   npm run dev:api   # http://localhost:4000/api/v1  (Swagger at /api/v1/docs)
   npm run dev:web   # http://localhost:3001
   ```

   Visit `http://localhost:3001/login` and sign in with one of the seeded accounts.

## Environment variables

See [`.env.example`](.env.example) for the full list with inline comments. The
important ones for local development:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string used by Prisma at runtime and for migrations |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Signing secrets for access/refresh tokens — **must** be changed for any non-local environment |
| `CORS_ORIGIN` | Must match the URL the web app is served from |
| `NEXT_PUBLIC_API_URL` | Base URL the frontend uses to call the API |
| `STORAGE_PROVIDER` | `local` for now; will support `s3`/`cloudinary`/`vercel-blob`/`supabase` once the Media module (Phase 7) lands |

Never commit a real `.env` file — it's already gitignored.

## Database

- Schema: [`database/prisma/schema.prisma`](database/prisma/schema.prisma)
- Migrations: `database/prisma/migrations/`
- Seed: [`database/prisma/seed.ts`](database/prisma/seed.ts)

Common commands (run from the repo root):

```bash
npm run prisma:generate   # regenerate the Prisma client
npm run prisma:migrate    # create + apply a new migration (dev)
npm run prisma:seed       # re-run the seed script (safe to re-run — upserts)
npm run prisma:studio     # open Prisma Studio to browse data
```

## Admin account setup & seeded users

`npm run prisma:seed` creates five **development-only** accounts, all with the
password `DevPassword!2026`:

| Role | Email |
|------|-------|
| Super Admin | `admin@samplemethodistsociety.dev` |
| Minister | `minister@samplemethodistsociety.dev` |
| Secretary | `secretary@samplemethodistsociety.dev` |
| Treasurer | `treasurer@samplemethodistsociety.dev` |
| Media Officer | `media@samplemethodistsociety.dev` |

**Change or remove these before any real deployment.** They exist purely so the
church's staff structure and RBAC can be demonstrated end-to-end during development.

## Testing

```bash
cd apps/api && npm test        # NestJS unit tests (Jest)
cd apps/api && npm run test:e2e
```

Frontend tests will be added alongside each UI module as it's built.

## Production build

```bash
npm run build:api
npm run build:web
```

## Deployment

Target architecture: Next.js on Vercel, NestJS on a Vercel-compatible Node host (or
any Node host), PostgreSQL on a managed provider (Neon, Supabase, etc.) — never a
local database in production. See [`docs/deployment.md`](docs/deployment.md) (added
as later phases near production-readiness).

## Security

See [`docs/security.md`](docs/security.md) for the full model. Highlights already in
place: bcrypt password hashing, JWT access tokens + rotated httpOnly refresh tokens,
account lockout after repeated failed logins, granular permission-based RBAC (not
just role checks), Helmet security headers, rate limiting, centralized error handling
that never leaks stack traces, and an audit log for sensitive actions.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system architecture & build roadmap
- [`docs/roles-and-permissions.md`](docs/roles-and-permissions.md) — the RBAC model

## Troubleshooting

- **"Port 5432 already in use" / migrations fail with access denied** — this
  machine likely has a native PostgreSQL install also listening on 5432. The bundled
  `docker-compose.yml` already avoids this by publishing on 5433; make sure your
  `.env` matches.
- **`EADDRINUSE` on 3000/3001/4000** — a previous dev server is still running in the
  background. Stop it (or find the owning process) before restarting.
