# 🌐 100% FREE & UNLIMITED HOSTING GUIDE ($0/Month Forever)

This guide provides the complete setup for hosting the **Methodist Church Ghana Management System** monorepo using **100% free, production-grade cloud services** with zero monthly costs ($0/mo forever), complete **GitHub processes**, and automated continuous integration/deployment (CI/CD).

---

## 💎 The 100% Free Tech Stack

| Service Layer                  | Platform                                              | Free Tier Allowances                                         | Cost                 |
| :----------------------------- | :---------------------------------------------------- | :----------------------------------------------------------- | :------------------- |
| **Code Repository**      | **GitHub**                                      | Unlimited public/private repos, free GitHub Actions CI/CD    | **$0.00 / mo** |
| **Frontend Web App**     | **Vercel** (or Cloudflare Pages)                | Unlimited deployments, 100 GB/mo bandwidth, global CDN, SSL  | **$0.00 / mo** |
| **Backend API**          | **Koyeb** or **Render** (+ Keep-Alive)    | 512 MB RAM, persistent Node.js runtime / serverless API      | **$0.00 / mo** |
| **Database**             | **Neon.tech** or **Supabase**             | Serverless PostgreSQL (500 MB - 1 GB DB, Pooled connections) | **$0.00 / mo** |
| **File / Media Storage** | **Cloudflare R2** or **Supabase Storage** | 10 GB storage, 0 egress fees (unlimited bandwidth downloads) | **$0.00 / mo** |

---

## 📑 Quick Navigation

1. [Step 1: GitHub Repository Setup &amp; Push Workflow](#step-1-github-repository-setup--push-workflow)
2. [Step 2: Free PostgreSQL Database (Neon / Supabase)](#step-2-free-postgresql-database-neon--supabase)
3. [Step 3: Deploy Next.js Web App to Vercel via GitHub](#step-3-deploy-nextjs-web-app-to-vercel-via-github)
4. [Step 4: Deploy NestJS API Backend via GitHub](#step-4-deploy-nestjs-api-backend-via-github)
   - [Option A: Koyeb (Recommended — Always On, No Sleeping)](#option-a-koyeb-recommended--always-on-no-sleeping)
   - [Option B: Render (Free Tier + UptimeRobot Keep-Alive Trick)](#option-b-render-free-tier--uptimerobot-keep-alive-trick)
   - [Option C: Vercel Serverless Function (All-in-One Vercel)](#option-c-vercel-serverless-function-all-in-one-vercel)
5. [Step 5: Automated GitHub Actions CI/CD Pipeline](#step-5-automated-github-actions-cicd-pipeline)
6. [Step 6: Free Media Storage (Cloudflare R2 / Supabase)](#step-6-free-media-storage-cloudflare-r2--supabase)
7. [Step 7: Complete Environment Variables Matrix](#step-7-complete-environment-variables-matrix)
8. [Post-Deployment Checklist &amp; Maintenance](#post-deployment-checklist--maintenance)

---

## 🐙 Step 1: GitHub Repository Setup & Push Workflow

Follow these exact terminal commands to push your project to GitHub.

### 1. Initialize Local Git Repository (if not already initialized):

Open your terminal in the root directory (`f:\Projects\NextJS\jeapmethodist`) and run:

```bash
# Initialize git in project root
git init

# Verify files to be committed (ignores node_modules and .env automatically)
git status

# Stage all files
git add .

# Create initial commit
git commit -m "feat: initial commit for Methodist Church Ghana management system"
```

---

### 2. Create a GitHub Repository:

#### Option A: Using the GitHub Website (UI)

1. Go to [github.com/new](https://github.com/new) and log in.
2. Enter Repository Name: `jeapmethodist` (or `church-management`).
3. Choose **Public** or **Private**.
4. **Do NOT check** "Initialize with README", `.gitignore`, or License (your project already has these).
5. Click **Create repository**.

#### Option B: Using GitHub CLI (`gh`)

If you have the GitHub CLI installed:

```bash
gh repo create jeapmethodist --public --source=. --remote=origin --push
```

---

### 3. Connect Local Project to GitHub and Push:

Run the following commands in your terminal (replace `YOUR_GITHUB_USERNAME` with your actual GitHub username):

```bash
# Rename default branch to main
git branch -M main

# Add remote repository URL
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/jeapmethodist.git

# Push code to GitHub main branch
git push -u origin main
```

---

### 4. Ongoing Git Workflow (Day-to-Day Development):

Whenever you make updates to your project, run:

```bash
# 1. Check modified files
git status

# 2. Stage changes
git add .

# 3. Commit with a clear message
git commit -m "feat: update home page styling and favicon"

# 4. Push to GitHub (Triggers Automatic Vercel & Koyeb Deployments!)
git push origin main
```

---

## 🗄️ Step 2: Free PostgreSQL Database (Neon / Supabase)

### Option A: Neon.tech (Recommended)

1. Sign up for a free account at [Neon.tech](https://neon.tech) (No credit card needed).
2. Create a new project: `church-management-db`.
3. Copy your connection strings from the dashboard:
   - **Pooled Connection String** (`DATABASE_URL`) — use this for your API.
   - **Direct Connection String** (`DIRECT_URL`) — use this for running Prisma migrations.

### Option B: Supabase

1. Create a free account at [Supabase.com](https://supabase.com).
2. Create a project and head to **Project Settings → Database**.
3. Copy the **Transaction Connection Pooler** string (`DATABASE_URL`) and **Direct Connection** string (`DIRECT_URL`).

### Deploy Database Schema:

Run initial database migrations from your local workspace to populate tables:

```bash
# In your local PowerShell or Bash terminal:
$env:DATABASE_URL="postgresql://user:pass@ep-cool-db.neon.tech/neondb?sslmode=require"
$env:DIRECT_URL="postgresql://user:pass@ep-cool-db.neon.tech/neondb?sslmode=require"

# Apply migrations to production database
npm run prisma:migrate
# (Optional) Seed initial demo data
npm run prisma:seed
```

---

## 🌐 Step 3: Deploy Next.js Web App to Vercel via GitHub

Vercel seamlessly connects to GitHub to provide automated continuous deployment (CI/CD). Every time you push to GitHub, Vercel builds and deploys your changes automatically.

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and log in with your GitHub account.
2. Click **Import Project** and select your GitHub repository (`jeapmethodist`).

### 2. Configure Vercel Project Settings:

- **Framework Preset**: `Next.js`
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Add Environment Variables in Vercel UI:

| Variable Name           | Value                                 | Description                     |
| :---------------------- | :------------------------------------ | :------------------------------ |
| `NEXT_PUBLIC_API_URL` | `https://your-api.koyeb.app/api/v1` | Production backend API endpoint |
| `DEFAULT_CURRENCY`    | `GHS`                               | Ghana Cedi currency default     |
| `DEFAULT_TIMEZONE`    | `Africa/Accra`                      | Accra timezone setting          |

4. Click **Deploy**. Vercel will build and assign your free live URL (e.g. `https://jeapmethodist.vercel.app`).

### 🔄 Automatic GitHub Previews & Production Builds:

- **`git push origin main`** → Triggers automatic deployment to **Production URL**.
- **Pull Requests (PRs)** → Triggers an automatic **Preview Deployment URL** so you can review UI changes before merging into `main`.

---

## ⚡ Step 4: Deploy NestJS API Backend via GitHub

### Option A: Koyeb (Recommended — Always On, No Sleeping)

Koyeb connects directly to GitHub and provides a **100% free Nano Instance** (512MB RAM) that **never sleeps** and requires **no credit card**.

1. Sign up at [Koyeb.com](https://www.koyeb.com) using your GitHub account.
2. Click **Create Web Service** and select **GitHub**.
3. Select your repository (`jeapmethodist`) and set:
   - **Branch**: `main`
   - **Work directory**: `apps/api`
   - **Build command**: `npm run build`
   - **Run command**: `npm run start:prod`
   - **Port**: `4000` (or `8000`)
4. Add Environment Variables:
   ```env
   DATABASE_URL=postgresql://user:pass@ep-cool-db.neon.tech/neondb?sslmode=require
   DIRECT_URL=postgresql://user:pass@ep-cool-db.neon.tech/neondb?sslmode=require
   JWT_SECRET=super-secret-key-1234567890
   JWT_REFRESH_SECRET=super-refresh-key-1234567890
   CORS_ORIGIN=https://jeapmethodist.vercel.app
   NODE_ENV=production
   API_PORT=4000
   API_PREFIX=api/v1
   ```
5. Click **Deploy**. Koyeb automatically rebuilds every time you push to GitHub!

---

### Option B: Render (Free Tier + UptimeRobot Keep-Alive Trick)

1. Sign up at [Render.com](https://render.com) using your GitHub account.
2. Click **New → Web Service** and select `jeapmethodist`.
3. Configure settings:
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Auto-Deploy**: `Yes` (Triggered on every GitHub push)
4. Add environment variables (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, etc.).
5. Click **Create Web Service**.

#### ⏰ Render Keep-Alive Trick (Prevent Sleeping for Free):

1. Sign up for a free account at [cron-job.org](https://cron-job.org) or [UptimeRobot.com](https://uptimerobot.com).
2. Create an HTTP Monitor/Cron Job targeting `https://your-api.onrender.com/api/v1/health` every 5-10 minutes.
3. This keeps your Render API awake 24/7 with zero cold starts!

---

### Option C: Vercel Serverless Function (All-in-One Vercel)

Deploy both Next.js and NestJS to Vercel for zero cost:

1. Create `apps/api/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ]
}
```

2. Push to GitHub or deploy via terminal: `npx vercel --cwd apps/api --prod`

---

## 🤖 Step 5: Automated GitHub Actions CI/CD Pipeline

To ensure that broken code is never deployed to production, you can set up automated build checks using GitHub Actions.

Create `.github/workflows/ci.yml` in your project root:

```yaml
name: CI / Build Validation

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type Check Next.js Frontend
        run: npm run lint --workspace=apps/web

      - name: Build Next.js Web App
        run: npm run build:web

      - name: Build NestJS API
        run: npm run build:api
```

Whenever you push to GitHub or open a Pull Request, GitHub Actions will automatically run tests and verify that the build compiles cleanly!

---

## 📦 Step 6: Free Media Storage (Cloudflare R2 / Supabase)

To store uploaded church documents, crests, and member avatars for $0:

| Provider                   | Free Allowance     | Egress (Bandwidth) Cost                 | Link                                        |
| :------------------------- | :----------------- | :-------------------------------------- | :------------------------------------------ |
| **Cloudflare R2**    | 10 GB free / month | **$0 (Unlimited Free Bandwidth)** | [Cloudflare R2](https://dash.cloudflare.com) |
| **Supabase Storage** | 1 GB free / month  | Included in free tier                   | [Supabase Storage](https://supabase.com)     |

Set your storage environment variables on your backend service:

```env
STORAGE_PROVIDER=s3
STORAGE_BUCKET=church-uploads
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=your-r2-access-key
STORAGE_SECRET_KEY=your-r2-secret-key
STORAGE_PUBLIC_URL=https://pub-your-id.r2.dev
```

---

## 📋 Step 7: Complete Environment Variables Matrix

Copy and fill these in your respective deployment platform settings:

```env
# =============================================================================
# 100% FREE PRODUCTION ENVIRONMENT VARIABLES
# =============================================================================

# Database (Neon.tech or Supabase - Free Tier)
DATABASE_URL="postgresql://user:pass@ep-cool-db.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-cool-db.neon.tech/neondb?sslmode=require"

# Auth Secrets (Generate strong strings)
JWT_SECRET="generate-64-character-random-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="generate-another-64-character-random-key"
JWT_REFRESH_EXPIRES_IN="7d"

# API Service Config
NODE_ENV="production"
API_PORT="4000"
API_PREFIX="api/v1"
CORS_ORIGIN="https://jeapmethodist.vercel.app"

# Frontend Next.js (Set on Vercel)
NEXT_PUBLIC_API_URL="https://your-api.koyeb.app/api/v1"
DEFAULT_CURRENCY="GHS"
DEFAULT_TIMEZONE="Africa/Accra"
```

---

## 🛡️ Post-Deployment Checklist & Maintenance

- [X] **Git Remote Configured**: Connected to GitHub (`origin main`).
- [X] **Automatic CI/CD Active**: Pushing code automatically updates Vercel & Koyeb/Render.
- [X] **Database Migrations Verified**: Tables created on Neon/Supabase DB.
- [X] **CORS Matched**: `CORS_ORIGIN` matches Vercel frontend URL (`https://...vercel.app`).
- [X] **HTTPS Enabled**: Vercel and Koyeb/Render auto-provision free SSL certificates.

---

*Guide updated for Methodist Church Ghana Management System — GitHub & 100% Free Hosting Stack.*
