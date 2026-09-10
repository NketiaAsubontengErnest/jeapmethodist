# Methodist Church Ghana Management System — Development Login Credentials

This document provides the default development credentials seeded into the database for testing the **Staff & Admin Management Portal**.

> **Note:** These credentials are created for development and testing environments only. In production environments, credentials are set during initial deployment and passwords must be changed upon first login.

---

## Staff & Administrator Accounts

| Role Name                      | Email Address                            | Password             | Key Responsibilities & Access Scope                                                                                                             |
| :----------------------------- | :--------------------------------------- | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Super Admin**          | `admin@samplemethodistsociety.dev`     | `ges`              | Full administrative access, system configuration, audit logs, role management, user provisioning, member management, finance, and CMS settings. |
| **Minister in Charge**   | `minister@samplemethodistsociety.dev`  | `DevPassword!2026` | Pastoral oversight, member rolls, spiritual leadership rosters, attendance reports, and visitor follow-ups.                                     |
| **Society Secretary**    | `secretary@samplemethodistsociety.dev` | `DevPassword!2026` | Member database CRUD, visitor management, class system records, and attendance tracking.                                                        |
| **Society Treasurer**    | `treasurer@samplemethodistsociety.dev` | `DevPassword!2026` | Financial accounting, tithes, harvest records, assessments, and financial report generation.                                                    |
| **Media & Tech Officer** | `media@samplemethodistsociety.dev`     | `DevPassword!2026` | Sermon library uploads, event management, press releases, media gallery, and public website publishing.                                         |

---

## How to Login

1. Start the development servers:
   ```bash
   npm run dev:api   # Starts NestJS API on http://localhost:4000
   npm run dev:web   # Starts Next.js Web App on http://localhost:3000
   ```
2. Open your browser and navigate to **`http://localhost:3000/login`** (or click **"Staff Portal"** in the top navigation bar).
3. Enter any of the email addresses and the password `DevPassword!2026`.
