# Roles & Permissions

Access control is **permission-based**, not role-name-based: every protected API
endpoint declares the exact permission code(s) it requires
(`@RequirePermissions('member.view')`), and a guard checks the caller's role against
that list. Roles are just editable, named bundles of permissions — an administrator
can change what a role can do (`PATCH /api/v1/roles/:id`) without a code change or
deploy.

## Permission catalogue

| Code | Module | Meaning |
|------|--------|---------|
| `member.view` / `.create` / `.update` / `.delete` | member | Church member records |
| `visitor.view` / `.create` / `.update` / `.delete` | visitor | Visitor records & follow-up |
| `attendance.view` / `.create` / `.update` / `.delete` | attendance | Attendance sessions & records |
| `ministry.view` / `.create` / `.update` / `.delete` | ministry | Ministries & their rosters |
| `group.view` / `.create` / `.update` / `.delete` | group | Church groups & their rosters |
| `leadership.view` / `.create` / `.update` / `.delete` | leadership | Leadership positions & profiles |
| `finance.view` / `.create` / `.update` / `.delete` / `.report` | finance | Giving, offerings, expenses |
| `event.view` / `.create` / `.update` / `.delete` | event | Events & church programmes |
| `sermon.view` / `.create` / `.update` / `.delete` | sermon | Sermon library (admin management) |
| `news.view` / `.create` / `.update` / `.delete` | news | News articles (admin management) |
| `prayer-request.view` / `.update` | prayer-request | Private prayer requests — deliberately separate from `member.view` (see below) |
| `media.view` / `.upload` / `.update` / `.delete` | media | Media library (not yet backed by real file storage) |
| `website.publish` | website | Publishing public-facing content |
| `user.view` / `.create` / `.update` / `.delete` | user | Staff accounts |
| `settings.manage` | settings | Website CMS settings, role/permission management |
| `audit.view` | audit | Audit log access |

The source of truth is [`apps/api/src/common/constants/permissions.ts`](../apps/api/src/common/constants/permissions.ts);
new permission codes are added there and to the seed script together as each phase
introduces new modules.

## Seeded system roles

Seeded by `database/prisma/seed.ts`, matching section 11 of the build spec. These are
marked `isSystem: true` — they can be edited (including their permission set) but not
deleted, so the five operational accounts the church actually uses always resolve to
a real role.

| Role | Default permissions | Notes |
|------|---------------------|-------|
| **SUPER_ADMIN** | every permission | Full system access |
| **MINISTER** | `member.view`, `visitor.view`, `attendance.view`, `event.view`, `ministry.view`, `group.view`, `leadership.view/update`, `prayer-request.view/update`, `sermon.view/create/update/delete`, `news.view` | Pastoral oversight — manages sermons and leadership records, views everything else, **no finance access at all** |
| **SECRETARY** | `member.view/create/update`, `visitor.view/create/update`, `attendance.view/create/update`, `event.view/create/update`, `ministry.view/create/update`, `group.view/create/update`, `leadership.view/create/update` | Primary records officer; no delete permissions anywhere, no finance access, no prayer-request access (private pastoral data) |
| **TREASURER** | `finance.view/create/update/report` | No member-record access unless explicitly granted; no `finance.delete` by default (admin-only) |
| **MEDIA_OFFICER** | `media.view/upload/update`, `website.publish`, `event.view`, `sermon.view/create/update/delete`, `news.view/create/update/delete` | Owns sermon and news publishing per section 11; no member, finance, or prayer-request access |

Each phase's seed script extends these lists to match the section-11 role
descriptions as new modules are built — e.g. Ministries/Groups/Leadership (phase 5)
and Sermons/News (this pass) both followed this pattern of granting create/update/
delete only to the roles the spec explicitly assigns that responsibility to.

## Custom roles

Beyond the five seeded roles, an admin can create additional roles via
`POST /api/v1/roles` with an arbitrary name and permission-code list — useful for a
church that wants, say, a "Youth Coordinator" role that doesn't map cleanly onto the
five defaults. Custom roles are not `isSystem` and can be deleted.

## Multi-permission endpoints

A handful of endpoints require more than one permission because they touch two
domains at once. `POST /visitors/:id/convert` (turning a visitor into a member)
requires **both** `visitor.update` and `member.create` — a role with only one
of the two cannot complete the conversion.

## Enforcement points

- **API**: `JwtAuthGuard` (global, requires a valid access token unless the route is
  `@Public()`) → `PermissionsGuard` (global, checks `@RequirePermissions(...)`
  metadata against the token's baked-in permission list).
- **Frontend**: `useAuth().hasPermission(code)` hides sidebar items and page actions
  the signed-in user isn't allowed to use. This is a UX convenience only — the API
  is the actual enforcement boundary, so a hidden button is not a substitute for the
  server-side check.

## A note on permission staleness

Access-token JWTs embed a snapshot of the user's permissions at login/refresh time
(access tokens are short-lived, 15 minutes by default). If an admin changes a role's
permissions, holders of that role see the change on their next token refresh, not
instantly mid-session. This is a deliberate, documented tradeoff for avoiding a
database round-trip on every single request.
