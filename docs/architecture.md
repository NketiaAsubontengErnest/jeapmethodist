# Architecture

## System overview

```
                    PUBLIC USERS
                         |
                         v
                  VERCEL / NEXT.JS  (apps/web)
                         |
             -------------------------
             |                       |
             v                       v
       PUBLIC WEBSITE          ADMIN PORTAL (/admin)
             |                       |
             -----------+-------------
                        |
                        v
                  NESTJS API  (apps/api)
                        |
                        v
                   PRISMA ORM
                        |
                        v
                 POSTGRESQL DB
                        |
             --------------------
             |                  |
             v                  v
        FILE STORAGE       EMAIL/SMS
         PROVIDER            (future)
```

`apps/web` and `apps/api` are deployed and scaled independently. The frontend never
talks to the database directly — everything goes through the versioned REST API
(`/api/v1/...`).

## Monorepo layout

```
apps/
  web/        Next.js (App Router) — public site + /admin portal
  api/        NestJS — REST API
database/     Prisma schema, migrations, seed script — the single source of truth
              for the data model, shared by the API via the generated Prisma client
docs/         This documentation
docker-compose.yml   Local PostgreSQL for development only
```

`database/` is intentionally a sibling of `apps/`, not nested inside `apps/api`, so
that (a) the schema stays framework-agnostic and (b) any future service (e.g. a
background worker) can depend on the same generated Prisma client without depending
on the API app itself.

## Backend module structure (`apps/api/src`)

Each domain lives in its own NestJS module with `*.controller.ts` (thin — routing +
permission decorators only), `*.service.ts` (business logic + Prisma calls), and
`dto/` (class-validator request/response shapes). Cross-cutting concerns live under
`common/`:

- `common/guards/jwt-auth.guard.ts` — global auth guard; routes opt out with `@Public()`
- `common/guards/permissions.guard.ts` — enforces `@RequirePermissions(...)`
- `common/filters/http-exception.filter.ts` — normalizes every error response
- `common/constants/permissions.ts` — the canonical permission-code catalogue

Modules built so far:

| Module | Responsibility |
|--------|-----------------|
| `auth` | Login, refresh-token rotation, logout, change/forgot/reset password, account lockout |
| `users` | Staff account CRUD (create/list/update/deactivate) |
| `roles` | Role + permission management, permission catalogue |
| `audit` | Records and lists sensitive actions across all modules |
| `health` | `GET /api/v1/health` — liveness + DB connectivity check |
| `database` | `PrismaService`/`PrismaModule` — the shared Prisma client |
| `member-categories` | Configurable member categories (Full Member, Youth, ...) |
| `membership-statuses` | Configurable membership statuses (Active, Inactive, ...) |
| `members` | Member CRUD, search, auto-generated membership numbers |
| `families` | Household grouping — create families, add/remove members with a role |
| `visitors` | Visitor records, follow-up log, and visitor→member conversion |
| `programme-types` | Configurable attendance programme types (Sunday Worship, Bible Study, ...) |
| `attendance` | Attendance sessions, per-person records, and the aggregated reporting summary |
| `ministries` | Church ministries CRUD, leader assignments, and member roster management |
| `groups` | Church fellowship groups, cell groups, and sub-organizations roster management |
| `leadership` | Ecclesiastical & lay church leadership positions and active leader profiles |
| `settings` | Church branding, hero text, service schedule, and online giving (MoMo / bank) configuration |
| `sermons` | Public sermon media library, audio/video links, tags, and preacher metadata |
| `events` | Public church events calendar, RSVP requirements, and venue information |
| `news` | Public press releases, synod resolutions, and news articles |
| `contact` | Public contact inquiry form submission handling |
| `prayer-requests` | Intercessory prayer request submissions with confidential & anonymous support |

## Authentication model

- **Access token**: short-lived JWT (default 15m), returned in the login response
  body and kept **in memory only** on the client (never localStorage) to limit XSS
  exposure. Carries the user's id, role and a snapshot of their permission codes.
- **Refresh token**: opaque random token, stored **hashed** (SHA-256) in the
  `refresh_tokens` table, delivered as an `httpOnly`, `SameSite=Lax` cookie scoped to
  `/api/v1/auth`. Rotated on every use (`POST /auth/refresh` revokes the old token
  and issues a new one) so a leaked, already-used refresh token is inert.
- On page load, the web app calls `/auth/refresh` once to silently restore a session
  from the cookie, then `/auth/me` to get the current user + permissions.
- Account lockout: 5 failed logins locks the account for 15 minutes.
- Every login attempt (success, failure, lockout) and password change/reset is
  written to the audit log.

## Authorization model (RBAC)

Permissions are **not** inferred from role names in code — every protected endpoint
declares the exact permission codes it needs via `@RequirePermissions('member.view')`
etc., and `PermissionsGuard` checks the caller's role against that list. Roles are
just named bundles of permissions, editable at runtime (`PATCH /roles/:id`) without a
deploy. See [`roles-and-permissions.md`](roles-and-permissions.md) for the full
permission catalogue and the default role-to-permission mapping.

## Data model conventions

- UUID primary keys throughout.
- Soft-delete where history matters (e.g. deactivating a user rather than deleting
  it, since audit logs and future attendance/finance records will reference users).
- `AuditLog` is deliberately decoupled — `AuditService.record()` never throws, so a
  logging failure can never break the request it's observing.

## Members, families & visitors

- **Membership numbers** are auto-generated (`MEM-00001`, sequential) if not
  supplied, but a secretary can enter a pre-existing number instead.
- **Categories and statuses are separate, both configurable**: `MemberCategory`
  (Full Member, Youth, ...) answers "what kind of member," `MembershipStatus`
  (Active, Inactive, Transferred Out, ...) answers "are they currently active."
  Neither is hard-coded — both are database-backed lookup tables editable via
  `settings.manage`.
- **Members are soft-deleted** (`isActive: false`) rather than destroyed, since
  attendance, giving and ministry-membership records in later phases will
  reference members by id.
- **Families** are a join table (`FamilyMember`) between `Member` and
  `MemberFamily` carrying a role (Head, Spouse, Child, Dependant, Other) — a
  member can only appear once per family (unique constraint), and a family
  profile page lists every connected member.
- **Visitors are a separate model from Member**, not a member category, because
  the workflow is different (follow-up log, assigned staff, conversion). A
  visitor's `followUpStatus` is a fixed enum (New → Contacted → ... → Joined),
  and `POST /visitors/:id/convert` creates a real `Member` record and links
  back via `Visitor.convertedMemberId`, pre-filling name/contact details from
  the visitor record.

## Attendance

- **Programme types are configurable**, same pattern as member categories —
  seeded with the spec's examples (Sunday Worship, Bible Study, ...) but an
  admin can add/rename/deactivate them via `settings.manage`.
- An **`AttendanceSession`** is one dated occurrence of a programme (e.g.
  "Sunday Worship, 2026-09-06"). **`AttendanceRecord`** rows attach to it —
  either a registered member (Present/Absent/Excused, one record per member
  per session, enforced by a unique constraint) or a visitor (linked to a
  `Visitor` record, or a freeform name/anonymous headcount entry for a quick
  welcome-desk count).
- "Recording by QR code" from the spec is handled by the same member-search
  box the check-in screen already uses — scanning a member's QR feeds their
  membership number into the same search input rather than needing a
  separate camera-scanning code path.
- **`GET /attendance/summary`** computes the dashboard/report numbers (total,
  average, highest/lowest, gender and age-category breakdown, visitor and
  returning-visitor counts, and a trend bucketed by day/week/month/quarter/
  year) as an in-memory reduction over the sessions in range — simpler to
  read than hand-written SQL aggregation and fast enough at single-church
  scale.

## Build roadmap (spec section 68)

**Done, with full admin UI, tested:** Phase 1 (auth), Phase 2 (users/roles/
permissions/audit), Phase 3 (members/families/visitors), Phase 4 (attendance),
Phase 5 (ministries/groups/leadership), Phase 6 (events — `Event` model enriched
with startTime/endTime/organizer/ministry link/registration limit/contact info
beyond the original stub), Phase 7's sermon piece (no media/gallery upload
models yet — sermons link to externally-hosted video/audio/PDF URLs), Phase 8
(news + CMS settings — no Announcement model), Phase 10 (finance).

New permission codes for this pass: `sermon.view/create/update/delete` and
`news.view/create/update/delete`, granted to MINISTER (sermons only) and
MEDIA_OFFICER (both) per section 11's role descriptions — Secretary and
Treasurer get neither.

**Backend exists, admin management does not:** Phase 9's prayer requests and
contact forms — full CRUD/permissions/privacy-correct gating, but no
`/admin/prayer-requests` or contact-inbox page yet.

**Not built at all:** Media/Gallery upload (§20, §33 — no file storage
abstraction exists, so there is no upload capability anywhere in the system),
Announcements (§19), a generic follow-up/task system beyond visitor follow-up
(§54), global search (§31), notifications (§32).

**Not started:** Phase 11 (dedicated reports/dashboard beyond what each module
already exposes, CSV/PDF export beyond finance's CSV export), Phase 12 (security/
performance/SEO/accessibility hardening pass), Phase 13 (deployment).

### Known gaps as of this audit

A large amount of Phase 5–9 work happened in one pass without the usual
build → verify → report checkpoint. An audit afterward found and fixed several
real bugs, listed here so they aren't rediscovered:

- **Public website was entirely broken.** `apps/web/src/app/page.tsx` manually
  re-exported the `(public)` route group's layout/page, which conflicted with
  Next.js's own resolution of `app/(public)/page.tsx` for `/` and broke routing
  for every other page in the group (`/about`, `/ministries`, `/events`, ... all
  404'd). Fixed by deleting the shim — route groups don't need one.
- **`@CurrentUser('id')` silently returned the whole user object, not the id**,
  because the decorator ignored its argument. Every create/update in
  `ministries`, `groups`, and `leadership` that used this pattern would have
  thrown a Prisma validation error at runtime. Fixed the decorator itself to
  honor the selector (backward compatible with the existing `@CurrentUser()`
  no-argument usage elsewhere).
- **`contact` and `prayer-requests` POST endpoints took a plain inline TS type**
  instead of a class-validator DTO, so the global `ValidationPipe` never
  actually validated these public, unauthenticated form submissions. Added
  real DTOs with length limits and a request-rate throttle.
- **Prayer requests (explicitly private data per section 56) were gated behind
  `member.view`**, which Secretary also holds — exposing pastoral data to a
  role with no pastoral function. Added dedicated `prayer-request.view`/
  `.update` permissions, granted only to Minister and Super Admin.
- **Leadership positions had no update/delete endpoint** and `CreateLeadershipDto`
  didn't validate `startDate`/`endDate`. Both fixed.
- **Settings update accepted an arbitrary `Record<string, string>`** with no
  validation. Replaced with a whitelist DTO matching section 26's CMS fields
  (snake_case keys, matching the existing seed data and frontend convention —
  not the camelCase this DTO used on a first pass, corrected once the mismatch
  was spotted).

None of this should be read as "don't trust the codebase" — members, families,
visitors, attendance, ministries/groups/leadership, and finance all passed
targeted curl-based verification (including RBAC checks) both before and after
these fixes. It's a record of what large unsupervised passes tend to miss:
cross-cutting decorators, public/unauthenticated input paths, and permission
scoping for sensitive data — worth a deliberate check after any similarly
large pass in the future.
