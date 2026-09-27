# BUILD A COMPLETE METHODIST CHURCH GHANA WEBSITE + CHURCH MANAGEMENT SYSTEM

You are a senior full-stack software architect, UI/UX designer, NestJS developer, Next.js developer, PostgreSQL/Prisma developer, cybersecurity engineer, and DevOps engineer.

Your task is to design and build a complete production-ready web platform for a **single Methodist Church in Ghana**.

The system must consist of:

1. A professional public church website.
2. A secure church management/admin web application.
3. A REST API backend.
4. A PostgreSQL database.
5. Authentication and role-based access control.
6. Church membership/data management.
7. Attendance management.
8. Giving/offering/financial records.
9. Events and church programmes.
10. Ministries and groups.
11. Communication management.
12. Media management.
13. Reports and dashboards.
14. Audit logs.
15. Responsive mobile/tablet/desktop UI.
16. Production-ready deployment architecture.

The system is intended initially for **ONE Methodist Church/Society in Ghana**, not a multi-tenant SaaS platform.

The architecture should, however, be clean enough that it can later be expanded to support multiple churches if required.

---

# 1. TECHNOLOGY STACK

Use the following stack.

## Frontend

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React
- React Hook Form
- Zod
- TanStack Query
- Recharts
- Lucide React icons

Use Next.js App Router.

The frontend should contain:

### Public Website

/

/about

/about/church-history

/about/leadership

/ministries

/ministries/[slug]

/sermons

/sermons/[slug]

/events

/events/[slug]

/news

/news/[slug]

/gallery

/contact

/giving

/prayer-request

/visit-us

/privacy

/terms

### Management Portal

/admin

/admin/dashboard

/admin/members

/admin/members/[id]

/admin/attendance

/admin/attendance/new

/admin/events

/admin/ministries

/admin/groups

/admin/sermons

/admin/media

/admin/news

/admin/announcements

/admin/giving

/admin/expenses

/admin/reports

/admin/users

/admin/settings

/admin/audit-logs

---

# 2. BACKEND

Use:

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- Refresh tokens
- bcrypt/Argon2 password hashing
- class-validator
- class-transformer
- Swagger/OpenAPI
- Helmet
- CORS
- rate limiting
- structured logging

The backend must expose a clean REST API.

Example:

/api/v1/auth

/api/v1/members

/api/v1/attendance

/api/v1/events

/api/v1/ministries

/api/v1/groups

/api/v1/sermons

/api/v1/media

/api/v1/news

/api/v1/announcements

/api/v1/giving

/api/v1/expenses

/api/v1/reports

/api/v1/users

/api/v1/settings

/api/v1/audit-logs

---

# 3. DATABASE

Use PostgreSQL with Prisma.

Create a properly normalized database.

Main entities should include:

User

Role

Permission

Member

MemberFamily

FamilyMember

MembershipStatus

MemberCategory

ChurchPosition

Ministry

MinistryMember

ChurchGroup

GroupMember

AttendanceSession

AttendanceRecord

Event

EventRegistration

Sermon

Speaker

NewsArticle

Announcement

Gallery

GalleryImage

MediaFile

PrayerRequest

Testimony

Donation

Offering

OfferingSession

Expense

ExpenseCategory

FinancialAccount

FinancialTransaction

ChurchProgramme

Notification

AuditLog

ChurchSetting

ContactMessage

Visitor

VisitorFollowUp

---

# 4. MEMBER MANAGEMENT

Build a complete church member management system.

Each member should have fields such as:

- Member ID
- Membership number
- First name
- Middle name
- Last name
- Gender
- Date of birth
- Phone
- WhatsApp number
- Email
- Residential address
- Digital address
- Ghana region
- Ghana district/municipality
- Occupation
- Marital status
- Marriage date
- Emergency contact
- Date joined church
- Baptism status
- Baptism date
- Confirmation status
- Confirmation date
- Membership status
- Membership category
- Local society
- Ministry/group
- Skills
- Notes
- Profile photo
- Created date
- Updated date

Do not force unnecessary personal information.

Sensitive information must have appropriate access restrictions.

---

# 5. MEMBER CATEGORIES

Allow administrators to configure categories such as:

- Full Member
- Probationer
- Youth
- Young Adult
- Children
- Visitor
- New Convert
- Associate Member
- Former Member
- Inactive Member

Do not hard-code Methodist doctrine or membership classifications where the church may want to configure them.

---

# 6. FAMILY MANAGEMENT

Members should be grouped into families.

Allow:

- Create family
- Add family members
- Family head
- Spouse
- Children
- Dependants
- Emergency contact
- Family address
- Family phone

Provide a family profile page showing all connected members.

---

# 7. ATTENDANCE MANAGEMENT

Build a complete attendance system.

Administrators should be able to create attendance sessions for:

- Sunday Worship
- Bible Study
- Midweek Service
- Prayer Meeting
- Youth Service
- Children's Service
- Fellowship
- Special Programmes
- Custom programmes

Attendance should support:

- Present
- Absent
- Excused
- Visitor

Allow attendance recording by:

- Member search
- Member number
- QR code
- Manual selection

Dashboard should show:

- Total attendance
- Male attendance
- Female attendance
- Children
- Youth
- Visitors
- Returning visitors
- Attendance trend
- Average attendance
- Highest attendance
- Lowest attendance

Generate reports by:

- Day
- Week
- Month
- Quarter
- Year
- Programme

---

# 8. VISITOR MANAGEMENT

Create a visitor management module.

Visitors can be recorded with:

- Name
- Phone
- WhatsApp
- Email
- Gender
- Age category
- How they heard about the church
- Date visited
- Programme attended
- Address
- Interest in joining
- Follow-up status
- Assigned follow-up person
- Notes

Follow-up statuses:

- New
- Contacted
- Follow-up scheduled
- Interested
- Joined
- Not interested
- Could not reach

---

# 9. MINISTRIES AND GROUPS

Create a flexible ministry/group system.

Examples:

- Men's Fellowship
- Women's Fellowship
- Youth Fellowship
- Children's Ministry
- Choir
- Wesleyan Youth
- Evangelism
- Prayer Ministry
- Media Ministry
- Sunday School
- Ushering
- Welfare
- Protocol
- Technical Team

Do not assume that every church has exactly these groups.

Administrators must be able to create, edit and deactivate ministries/groups.

Each ministry should have:

- Name
- Description
- Leader
- Assistant leader
- Members
- Meeting schedule
- Contact information
- Announcements
- Events
- Documents

---

# 10. CHURCH LEADERSHIP

Create a configurable leadership section.

The system should support positions such as:

- Minister in Charge
- Society Steward
- Society Secretary
- Society Treasurer
- Lay/Church leadership positions
- Ministry leaders
- Circuit-related leadership where applicable
- Other church positions

IMPORTANT:

Do not hard-code the church's ecclesiastical structure as fact.

Make leadership positions configurable because the exact structure and terminology should be confirmed with the particular Methodist Church/Society.

Leadership profiles should support:

- Name
- Position
- Photo
- Biography
- Phone
- Email
- Display order
- Active/inactive

---

# 11. USER ROLES

Initially create approximately FIVE operational users.

Recommended roles:

## ROLE 1 — SUPER ADMIN / CHURCH ADMINISTRATOR

Full system access.

Can:

- Manage users
- Manage roles
- Manage members
- Manage attendance
- Manage ministries
- Manage events
- Manage website
- Manage reports
- Manage settings
- View audit logs

---

## ROLE 2 — MINISTER / MINISTER-IN-CHARGE

Can:

- View member information
- View attendance
- View church statistics
- View reports
- Manage sermons
- Manage pastoral announcements
- View prayer requests
- View visitor follow-ups
- Approve selected church content

Do not automatically give unrestricted financial editing privileges.

---

## ROLE 3 — SOCIETY SECRETARY / RECORDS OFFICER

Primary data-management user.

Can:

- Register members
- Edit member records
- Manage families
- Manage attendance
- Manage visitors
- Manage groups
- Manage church events
- Generate member reports
- Generate attendance reports

Should NOT have unrestricted financial permissions.

---

## ROLE 4 — SOCIETY TREASURER / FINANCE OFFICER

Can:

- Record offerings
- Record donations
- Record expenses
- Manage financial categories
- View financial reports
- Generate financial statements
- Manage financial transactions

Should NOT be able to edit member records unless explicitly granted permission.

---

## ROLE 5 — MEDIA / COMMUNICATIONS OFFICER

Can:

- Upload photos
- Upload videos
- Upload sermons
- Manage gallery
- Publish news
- Publish announcements
- Manage website banners
- Manage social media links
- Manage livestream links

The media user should not have access to financial information.

---

# 12. PERMISSION SYSTEM

Do NOT rely only on role names.

Implement granular permissions.

Examples:

member.view

member.create

member.update

member.delete

attendance.view

attendance.create

attendance.update

attendance.delete

finance.view

finance.create

finance.update

finance.delete

finance.report

event.view

event.create

event.update

event.delete

media.view

media.upload

media.update

media.delete

website.publish

user.view

user.create

user.update

user.delete

settings.manage

audit.view

Use RBAC with permission guards.

---

# 13. DASHBOARD

Create a beautiful administrative dashboard.

Dashboard cards:

- Total Members
- Active Members
- New Members
- Visitors
- Today's Attendance
- This Month's Attendance
- Upcoming Events
- Ministries
- Pending Follow-ups
- Monthly Giving
- Monthly Expenses

Charts:

- Membership growth
- Attendance trend
- Visitors trend
- Giving trend
- Expenses trend
- Membership by age group
- Membership by gender
- Membership by ministry

Recent activity:

- New member registered
- Attendance recorded
- Donation recorded
- Event created
- News published
- User login
- Profile updated

---

# 14. FINANCE MANAGEMENT

Build a simple but professional church financial management system.

Do not attempt to replace professional accounting software.

The system should record:

## Income

- Sunday offering
- Tithes
- Donations
- Thanksgiving
- Special offering
- Fundraising
- Other income

## Expenses

- Utilities
- Maintenance
- Transport
- Programmes
- Welfare
- Media
- Administration
- Salaries/allowances where appropriate
- Other expenses

Every financial record should include:

- Date
- Amount
- Category
- Description
- Reference
- Recorded by
- Approval status
- Attachment/receipt if applicable

Support:

- Income report
- Expense report
- Monthly summary
- Annual summary
- Category summary
- Export CSV/PDF

Use GHS as the default currency.

Do not process online payments initially unless specifically requested.

---

# 15. OFFERING RECORDING

Create an offering session system.

Example:

Sunday Worship
Date: 2026-09-06

Records:

- General offering
- Thanksgiving
- Tithe
- Missions
- Welfare
- Other

Allow authorized finance users to record totals.

Avoid exposing individual donor amounts to ordinary users.

---

# 16. EVENTS

Create a complete events module.

Fields:

- Event name
- Description
- Start date
- End date
- Start time
- End time
- Location
- Organizer
- Ministry
- Banner image
- Registration required
- Registration limit
- Contact information
- Status

Public website should display upcoming events.

Admin users should manage all events.

---

# 17. SERMON MANAGEMENT

Create sermon management.

Fields:

- Title
- Speaker
- Date
- Scripture
- Description
- Audio
- Video
- PDF
- Thumbnail
- Tags

Public users can browse sermons.

Allow embedding YouTube/Facebook livestream links.

Do not force video files to be stored directly on the application server.

Use external object storage/cloud media services where appropriate.

---

# 18. NEWS

Create church news.

Admin/media users can:

- Create article
- Upload featured image
- Add content
- Schedule publication
- Publish/unpublish
- Edit
- Delete

Public website:

/news

/news/[slug]

Include:

- Search
- Categories
- Related articles
- Social sharing buttons

---

# 19. ANNOUNCEMENTS

Create church announcements.

Examples:

- Sunday announcements
- Funeral announcements
- Meetings
- Programme changes
- Important notices

Allow:

- Draft
- Scheduled
- Published
- Expired

Display important announcements on the website.

---

# 20. MEDIA/GALLERY

Create a media library.

Support:

- Photos
- Videos
- Sermons
- Documents

Gallery categories:

- Sunday Service
- Church Programmes
- Youth
- Children
- Outreach
- Conferences
- Special Events

Allow albums.

Images must be optimized before delivery.

---

# 21. PRAYER REQUESTS

Public users can submit prayer requests.

Fields:

- Name
- Email
- Phone
- Prayer request
- Anonymous option
- Consent

Admin can:

- View
- Assign
- Mark as contacted
- Mark as prayed for
- Archive

Prayer requests must be treated as private data.

Only authorized users should access them.

---

# 22. CONTACT SYSTEM

Public contact page.

Include:

- Church address
- Phone
- Email
- WhatsApp
- Social media
- Service times
- Google Maps link
- Contact form

Contact submissions should appear inside admin dashboard.

---

# 23. VISITOR / FIRST-TIME GUEST FORM

Create a beautiful public form:

"Plan Your Visit"

Fields:

- Name
- Phone
- WhatsApp
- Email
- Preferred service
- Number attending
- Message

After submission:

- Store visitor record
- Notify authorized church users
- Create follow-up task

---

# 24. PUBLIC WEBSITE DESIGN

The website must look like a modern professional church website.

Do NOT create a generic ugly admin template.

Use:

- Modern typography
- Clean spacing
- Beautiful hero sections
- Professional photography placeholders
- Responsive navigation
- Mobile menu
- Modern cards
- Subtle animations
- Accessible contrast
- Professional footer

Use a Methodist-inspired visual identity without falsely claiming official denomination branding.

Primary visual direction:

- Deep red/burgundy
- White
- Gold accents
- Dark charcoal

But make the colors configurable through the CMS.

---

# 25. HOMEPAGE

Create:

## Hero

Church name

Short mission statement

Buttons:

"Join Us This Sunday"

"Watch Sermons"

"View Events"

## Service Times

Sunday service information.

## Welcome Section

Short church introduction.

## Upcoming Events

Display next 3–6 events.

## Latest Sermons

Display latest sermons.

## Church Ministries

Display ministry cards.

## Latest News

Display latest articles.

## Call to Action

"Become Part of Our Church Family"

## Giving

Provide information about giving without requiring payment integration initially.

## Footer

Include:

- Church name
- Address
- Phone
- Email
- Service times
- Quick links
- Social media
- Privacy
- Terms

---

# 26. WEBSITE CMS

Administrators should be able to manage:

- Church name
- Logo
- Favicon
- Address
- Phone
- Email
- WhatsApp
- Service times
- About text
- Mission
- Vision
- Social media
- Homepage hero
- Homepage sections
- Footer
- Contact details

Do not require developers to modify source code for ordinary content changes.

---

# 27. AUTHENTICATION

Implement:

- Login
- Logout
- Forgot password
- Reset password
- Change password
- Refresh token
- Session management
- Account lockout/rate limiting
- Optional 2FA architecture

Never store plaintext passwords.

Use secure HTTP-only cookies where appropriate.

---

# 28. SECURITY

Security is extremely important because the system contains member and financial information.

Implement:

- JWT
- Refresh token rotation where appropriate
- Password hashing
- RBAC
- Permission guards
- DTO validation
- SQL injection protection through Prisma
- XSS protection
- CSRF considerations
- CORS
- Helmet
- Rate limiting
- Secure headers
- Input sanitization
- File upload validation
- MIME type validation
- File size limits
- Audit logging
- Authentication logging
- Failed login monitoring

Never expose sensitive member information through public APIs.

Never expose financial data publicly.

Never expose private prayer requests publicly.

---

# 29. AUDIT LOG

Every sensitive action should be logged.

Log:

- User
- Action
- Module
- Entity
- Entity ID
- IP address
- User agent
- Timestamp
- Previous value where appropriate
- New value where appropriate

Examples:

"Secretary updated member"

"Treasurer recorded offering"

"Media Officer published sermon"

"Admin created user"

"Admin changed permission"

---

# 30. REPORTING

Build reports for:

## Membership

- Total members
- Active members
- New members
- Inactive members
- Members by age
- Members by gender
- Members by ministry
- Members by membership status

## Attendance

- Daily
- Weekly
- Monthly
- Annual
- Programme-based

## Finance

- Income
- Expenses
- Net balance
- Category breakdown
- Monthly comparison

## Visitors

- New visitors
- Follow-ups
- Converted/registered members

Allow export:

- CSV
- PDF

---

# 31. SEARCH

Implement global/admin search.

Search:

- Members
- Visitors
- Events
- Sermons
- News
- Ministries

Use pagination.

Do not load thousands of records into the browser at once.

---

# 32. NOTIFICATIONS

Build an internal notification system.

Notifications for:

- New visitor
- New prayer request
- New contact message
- Upcoming event
- Follow-up task
- Important announcement
- User account activity

Architecture should allow future integration with:

- Email
- SMS
- WhatsApp

Do not hard-code an expensive third-party SMS/WhatsApp provider.

Create provider interfaces.

---

# 33. FILE STORAGE

Do not store large files directly in PostgreSQL.

Create a media abstraction.

Example:

StorageProvider

LocalStorageProvider

CloudStorageProvider

Allow future integration with:

- Cloudinary
- S3-compatible storage
- Vercel Blob
- Supabase Storage

Store only metadata and URLs in PostgreSQL.

---

# 34. DATABASE RELATIONSHIPS

Design proper Prisma relationships.

Examples:

User -> Role

Role -> Permissions

Member -> Family

Member -> Ministries

Member -> Groups

Member -> AttendanceRecords

Event -> Registrations

Ministry -> Members

OfferingSession -> FinancialTransactions

FinancialTransaction -> User

NewsArticle -> User

Sermon -> Speaker

MediaFile -> User

PrayerRequest -> User/FollowUpUser

AuditLog -> User

Use foreign keys and appropriate indexes.

Use UUIDs where appropriate.

---

# 35. API DOCUMENTATION

Configure Swagger.

Swagger should be available in development and optionally protected in production.

Document:

- Authentication
- Members
- Attendance
- Events
- Ministries
- Finance
- Media
- News
- Sermons
- Reports
- Users

Every endpoint should have:

- DTO
- Validation
- Response type
- Authorization requirements
- Error handling

---

# 36. ERROR HANDLING

Implement centralized exception handling.

API responses should have a consistent structure.

Example:

{
  "success": false,
  "message": "Member not found",
  "statusCode": 404,
  "timestamp": "...",
  "path": "/api/v1/members/..."
}

Never expose internal stack traces in production.

---

# 37. FRONTEND UX

The dashboard must be easy for church staff who may not be highly technical.

Prioritize:

- Large readable buttons
- Clear navigation
- Simple forms
- Search
- Filters
- Confirmation dialogs
- Success messages
- Error messages
- Empty states
- Loading states
- Mobile responsiveness

Avoid overly complicated enterprise UI.

---

# 38. ADMIN SIDEBAR

Create:

Dashboard

Members

Attendance

Visitors

Ministries

Groups

Events

Sermons

Media

News

Announcements

Prayer Requests

Giving

Expenses

Reports

Users

Audit Logs

Settings

Logout

Hide menu items automatically according to permissions.

---

# 39. MOBILE RESPONSIVENESS

The entire application must work on:

- Desktop
- Laptop
- Tablet
- Android
- iPhone

The church secretary should be able to register a member using a phone.

The media officer should be able to upload photos from a phone.

The minister should be able to view reports from a phone.

---

# 40. ACCESSIBILITY

Follow WCAG principles.

Implement:

- Keyboard navigation
- Accessible forms
- Proper labels
- ARIA where necessary
- Good contrast
- Focus states
- Screen-reader-friendly components

---

# 41. SEO

Public website must be SEO-friendly.

Implement:

- Metadata
- Open Graph
- Twitter/X cards
- Sitemap
- Robots.txt
- Canonical URLs
- Structured data where appropriate
- Semantic HTML

Each page should have unique metadata.

---

# 42. PERFORMANCE

Optimize for Vercel.

Use:

- Next.js Server Components where appropriate
- Image optimization
- Lazy loading
- Pagination
- Caching
- API caching where appropriate
- Database indexes
- Efficient Prisma queries
- Avoid N+1 queries

Do not load unnecessary data.

---

# 43. ENVIRONMENT VARIABLES

Create:

.env.example

Include variables such as:

DATABASE_URL=

DIRECT_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

NEXT_PUBLIC_API_URL=

CORS_ORIGIN=

STORAGE_PROVIDER=

STORAGE_BUCKET=

STORAGE_REGION=

STORAGE_ACCESS_KEY=

STORAGE_SECRET_KEY=

EMAIL_PROVIDER=

EMAIL_API_KEY=

Do not commit secrets.

---

# 44. PROJECT STRUCTURE

Use a clean monorepo structure:

church-management/

apps/

web/

api/

packages/

types/

config/

database/

docs/

scripts/

README.md

The web application is Next.js.

The API is NestJS.

The database layer is Prisma/PostgreSQL.

---

# 45. NESTJS STRUCTURE

Use modules such as:

src/

auth/

users/

roles/

permissions/

members/

families/

attendance/

visitors/

ministries/

groups/

events/

sermons/

media/

news/

announcements/

prayer-requests/

giving/

expenses/

finance/

reports/

notifications/

settings/

audit/

common/

database/

health/

Each module should contain:

controller

service

module

dto

entities/types where appropriate

guards where appropriate

---

# 46. DATABASE MIGRATIONS

Use Prisma migrations.

Create:

- Initial migration
- Seed script
- Development seed data

Seed:

1 admin user
1 minister
1 secretary
1 treasurer
1 media officer

Use fake development credentials only.

Never use real passwords in source code.

---

# 47. DEMO DATA

Create realistic Ghanaian demo data.

Use fictional names.

Example:

Church:

"Methodist Church Ghana — [Sample Society Name]"

Members from:

Greater Accra

Ashanti

Central

Eastern

Western

Volta

Northern

Upper East

Upper West

Do not use real people's private information.

---

# 48. GHANA-SPECIFIC REQUIREMENTS

Default:

Currency: GHS

Phone format:

+233XXXXXXXXX

Timezone:

Africa/Accra

Date format should be configurable.

Use Ghana regions where geographical information is needed.

Do not hard-code old administrative boundaries without allowing configuration.

---

# 49. CHURCH WEBSITE CONTENT

Create professional placeholder content for:

- About the Church
- Welcome message
- Mission
- Vision
- Ministries
- Worship services
- Leadership
- History
- Community outreach
- Events
- Sermons
- News

Clearly mark generated placeholder content so the church can replace it.

Do not claim facts about the specific church that have not been provided.

---

# 50. SOCIAL MEDIA

Allow administrators to configure:

- Facebook
- YouTube
- Instagram
- TikTok
- WhatsApp
- X/Twitter

Display only configured networks.

---

# 51. FUTURE INTEGRATIONS

Design interfaces for future integration with:

- SMS provider
- WhatsApp Business API
- Email provider
- Online payments
- Mobile Money
- YouTube
- Facebook
- Google Calendar

Do not implement expensive integrations unless explicitly requested.

---

# 52. ONLINE GIVING

For version 1:

Create a public Giving page.

Show:

- Giving information
- Bank information
- Mobile Money information
- Giving instructions

Keep payment processing disabled unless configured.

Future architecture should support:

- Mobile Money
- Card
- Bank
- Payment gateway

Never store card details.

---

# 53. CHURCH CALENDAR

Create a calendar view.

Display:

- Worship
- Bible study
- Meetings
- Youth events
- Women's fellowship
- Men's fellowship
- Outreach
- Special programmes

Allow admins to create recurring events.

---

# 54. TASK/FOLLOW-UP SYSTEM

Create a simple follow-up system.

Users with appropriate permission can assign:

- Visitor follow-up
- Member follow-up
- Welfare follow-up
- Pastoral follow-up

Fields:

- Task
- Assigned user
- Due date
- Priority
- Status
- Notes

Statuses:

Pending

In Progress

Completed

Cancelled

---

# 55. APPROVAL WORKFLOW

For sensitive actions, create optional approval workflows.

Example:

Treasurer records financial transaction.

Another authorized person can approve it.

Media officer writes article.

Authorized administrator publishes it.

The workflow should be configurable.

---

# 56. PRIVACY

Create a privacy-conscious system.

Member information should not be publicly searchable.

Only authorized authenticated users should see private member information.

Separate:

PUBLIC DATA

from

PRIVATE DATA.

Examples of public:

- Church name
- Address
- Service times
- Public events
- Public sermons
- Public leadership profiles

Private:

- Member phone numbers
- Addresses
- Financial records
- Prayer requests
- Internal notes
- Attendance records
- Emergency contacts

---

# 57. BACKUPS

Design database backup procedures.

Document:

- Database backup
- Restore procedure
- Media backup
- Disaster recovery

Do not claim Vercel itself is a complete backup solution.

---

# 58. TESTING

Write tests.

Backend:

- Unit tests
- Service tests
- Controller tests
- Authentication tests
- Permission tests
- API integration tests

Frontend:

- Component tests
- Form validation tests
- Critical user-flow tests

Important test cases:

- Unauthorized user cannot access finance
- Media officer cannot access finance
- Secretary can create members
- Treasurer can create financial records
- Admin can manage users
- Public user cannot access admin
- Invalid input is rejected
- Duplicate member number is rejected

---

# 59. SECURITY TESTING

Test:

- SQL injection
- XSS
- Broken access control
- Privilege escalation
- Invalid JWT
- Expired JWT
- Rate limiting
- File upload vulnerabilities
- Unauthorized API access
- IDOR vulnerabilities

---

# 60. DEPLOYMENT

Prepare the application for Vercel.

Frontend:

Deploy Next.js to Vercel.

Backend:

Deploy NestJS in a Vercel-compatible/serverless configuration where appropriate.

Database:

Use managed PostgreSQL such as:

- Neon
- Supabase
- another production PostgreSQL provider

Do not depend on local PostgreSQL in production.

Configure environment variables through the deployment platform.

The application must not assume:

localhost

is the production database.

---

# 61. VERCEL ARCHITECTURE

Preferred architecture:

                    PUBLIC USERS
                         |
                         v
                  VERCEL / NEXT.JS
                         |
             -------------------------
             |                       |
             v                       v
       PUBLIC WEBSITE          ADMIN DASHBOARD
             |                       |
             -----------+-------------
                        |
                        v
                  NESTJS API
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
         PROVIDER            FUTURE

Keep frontend and backend logically separated.

---

# 62. HEALTH CHECK

Create:

GET /api/v1/health

Return:

- application status
- database status
- environment
- timestamp
- version

Do not expose secrets.

---

# 63. VERSIONING

API should use:

/api/v1/

Do not break existing API contracts when adding features.

---

# 64. DOCUMENTATION

Create a comprehensive README.

Include:

- Project overview
- Architecture
- Technologies
- Installation
- Environment variables
- Database setup
- Prisma migration
- Seed
- Development
- Testing
- Production build
- Vercel deployment
- Admin account setup
- Security
- Backup
- Troubleshooting

Also create:

docs/

architecture.md

database.md

api.md

deployment.md

security.md

roles-and-permissions.md

user-guide.md

---

# 65. DEVELOPMENT COMMANDS

The project should support commands such as:

npm install

npm run dev

npm run build

npm run test

npm run lint

npm run prisma:generate

npm run prisma:migrate

npm run prisma:seed

npm run prisma:studio

---

# 66. CODE QUALITY

Follow:

- SOLID principles
- DRY
- Clean architecture principles
- Dependency injection
- DTO validation
- Strong TypeScript typing
- Meaningful naming
- Small services
- Reusable UI components

Do not create massive files.

Do not put all business logic inside controllers.

Controllers should be thin.

Services should contain business logic.

---

# 67. IMPORTANT IMPLEMENTATION RULE

Do not attempt to generate the entire system as one enormous file.

Build it module-by-module.

Use reusable components.

Use database migrations.

Use proper relationships.

Use clear interfaces.

---

# 68. BUILD ORDER

Build in this exact order:

PHASE 1

Project setup

Next.js

NestJS

Prisma

PostgreSQL

Authentication

Environment configuration

---

PHASE 2

Users

Roles

Permissions

RBAC

Audit logs

---

PHASE 3

Members

Families

Membership categories

Visitor management

---

PHASE 4

Attendance

Attendance sessions

Attendance reports

---

PHASE 5

Ministries

Groups

Church leadership

---

PHASE 6

Events

Calendar

Church programmes

---

PHASE 7

Sermons

Media

Gallery

---

PHASE 8

News

Announcements

Website CMS

---

PHASE 9

Prayer requests

Contact forms

Visitor follow-up

Task management

---

PHASE 10

Giving

Offerings

Expenses

Financial reports

---

PHASE 11

Reports

Dashboard

CSV/PDF export

---

PHASE 12

Security hardening

Testing

Performance

SEO

Accessibility

---

PHASE 13

Deployment

Vercel

PostgreSQL

Storage

Environment variables

Production configuration

---

# 69. ADMIN DASHBOARD DESIGN

Create a premium-looking dashboard.

Left sidebar.

Top header.

Notification icon.

User profile.

Breadcrumbs.

Main content area.

Cards.

Charts.

Tables.

Filters.

Pagination.

Modal forms.

Confirmation dialogs.

Use responsive design.

Desktop:

Sidebar + content.

Mobile:

Bottom navigation or collapsible sidebar.

---

# 70. PUBLIC WEBSITE NAVIGATION

Header:

Home

About

Ministries

Sermons

Events

News

Gallery

Give

Contact

"Join Us" button

Mobile navigation must be excellent.

---

# 71. FOOTER

Create:

Church logo

Church name

Short description

Quick links

Ministries

Contact

Service times

Social media

Copyright

Privacy

Terms

---

# 72. CONTENT MANAGEMENT

Where possible, content should be database-driven.

Do not hard-code:

- Church name
- Service times
- Contact information
- Leadership
- Events
- News
- Sermons
- Ministries

These should come from the database/CMS.

---

# 73. ADMIN USER EXPERIENCE

When an administrator logs in, show:

"Good morning, [Name]"

Then:

Today's overview

Attendance

Upcoming events

Pending tasks

Recent activity

Important announcements

---

# 74. DATA IMPORT

Create a member import tool.

Allow:

CSV upload.

Example columns:

member_number

first_name

middle_name

last_name

gender

date_of_birth

phone

email

address

membership_status

date_joined

ministry

group

Validate imported data.

Show errors before committing.

Do not insert invalid rows.

Provide downloadable import template.

---

# 75. DATA EXPORT

Authorized users can export:

Members

Attendance

Visitors

Finance

Events

Reports

Exports must respect permissions.

Never allow a media officer to export private financial information.

---

# 76. DASHBOARD ROLE CUSTOMIZATION

The dashboard should change according to user role.

ADMIN:

Everything.

MINISTER:

Pastoral/member/attendance/events overview.

SECRETARY:

Members/attendance/visitors/events.

TREASURER:

Finance/giving/expenses/reports.

MEDIA:

News/sermons/gallery/events/announcements.

---

# 77. FINAL QUALITY REQUIREMENT

The finished system must NOT look like a generated demo.

It should look like a real professional church management product that could be deployed for a Methodist Church in Ghana.

Every page must have:

- Loading state
- Empty state
- Error state
- Responsive design
- Proper validation
- Proper authorization
- Consistent UI
- Consistent typography
- Consistent spacing

---

# 78. DO NOT DO THESE THINGS

Do not:

- Use fake APIs
- Use hard-coded database data in production pages
- Store passwords in plaintext
- expose private member data
- expose financial information publicly
- put secrets in Git
- use local filesystem storage as the only production storage
- create fake authentication
- bypass permissions
- put all code in one file
- use mock data after the database is implemented
- claim that generated church history is factual
- claim the system is officially endorsed by Methodist Church Ghana
- use official denominational trademarks/logos without permission

---

# 79. FINAL DELIVERABLE

When finished, provide:

1. Complete source code.
2. Working frontend.
3. Working NestJS backend.
4. PostgreSQL schema.
5. Prisma migrations.
6. Seed script.
7. Authentication.
8. RBAC.
9. Admin dashboard.
10. Public website.
11. Member management.
12. Attendance.
13. Visitor management.
14. Ministries.
15. Groups.
16. Events.
17. Sermons.
18. Media.
19. News.
20. Announcements.
21. Prayer requests.
22. Giving.
23. Expenses.
24. Reports.
25. Audit logs.
26. Website CMS.
27. API documentation.
28. Tests.
29. Security configuration.
30. Vercel deployment configuration.
31. Environment variable documentation.
32. Complete README.
33. Demo/seed data.
34. Production deployment instructions.

---

# 80. DEVELOPMENT BEHAVIOUR

You are an autonomous senior engineering agent.

Before writing code:

1. Inspect the project.
2. Create an architecture plan.
3. Create the database model.
4. Create the module structure.
5. Identify dependencies.
6. Implement the foundation first.

Then build incrementally.

After each major module:

1. Run TypeScript checks.
2. Run linting.
3. Run tests.
4. Run database validation.
5. Fix errors.
6. Continue.

Do not leave broken imports.

Do not leave TODO placeholders for core functionality.

Do not claim a feature is complete unless it works.

When a requirement is ambiguous, choose a sensible implementation that is configurable rather than hard-coded.

---

# 81. MOST IMPORTANT REQUIREMENT

This is a system for **one Methodist Church/Society in Ghana**.

The goal is not to create a generic ERP.

The goal is to create a simple, beautiful, secure and practical system that church leadership and administrative staff can actually use every week.

Prioritize:

DATA

MEMBERS

ATTENDANCE

FINANCE

EVENTS

MINISTRIES

COMMUNICATION

MEDIA

REPORTING

SECURITY

USABILITY

over unnecessary enterprise complexity.

Build the system as a real production application.

START WITH THE ARCHITECTURE AND PROJECT STRUCTURE, THEN IMPLEMENT PHASE 1.