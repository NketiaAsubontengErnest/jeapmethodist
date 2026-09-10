# 🌐 100% FREE & UNLIMITED VERCEL HOSTING GUIDE ($0/Month Forever)

This guide provides the complete setup for hosting **BOTH the Next.js Frontend AND the NestJS API Backend on Vercel** under a single **100% free** account with zero monthly costs ($0/mo forever) and no credit card requirements.

---

## 💎 The 100% Free All-on-Vercel Architecture

| Service Layer | Platform | Free Tier Allowances | Cost |
| :--- | :--- | :--- | :--- |
| **Code Repository** | **GitHub** | Unlimited public/private repos, free GitHub Actions CI/CD | **$0.00 / mo** |
| **Frontend Web App** | **Vercel Project 1** (`apps/web`) | Unlimited deployments, 100 GB/mo bandwidth, global CDN, SSL | **$0.00 / mo** |
| **Backend NestJS API** | **Vercel Project 2** (`apps/api`) | Serverless Node.js functions, instant scaling, SSL | **$0.00 / mo** |
| **Database** | **Neon.tech** or **Supabase** | Serverless PostgreSQL (500 MB - 1 GB DB, Pooled connections) | **$0.00 / mo** |
| **File / Media Storage** | **Cloudflare R2** or **Supabase** | 10 GB storage, 0 egress fees (unlimited bandwidth downloads) | **$0.00 / mo** |

---

## 📑 Quick Navigation

1. [Step 1: GitHub Repository Setup](#step-1-github-repository-setup)
2. [Step 2: Database Setup (Neon PostgreSQL)](#step-2-database-setup-neon-postgresql)
3. [Step 3: Deploy Next.js Frontend on Vercel](#step-3-deploy-nextjs-frontend-on-vercel)
4. [Step 4: Deploy NestJS API Backend on Vercel](#step-4-deploy-nestjs-api-backend-on-vercel)
5. [Step 5: Connect Frontend to Backend (CORS & URLs)](#step-5-connect-frontend-to-backend-cors--urls)
6. [Alternative Backend Options (Koyeb / Render)](#alternative-backend-options-koyeb--render)
7. [Complete Environment Variables Matrix](#complete-environment-variables-matrix)
8. [Post-Deployment Verification Checklist](#post-deployment-verification-checklist)

---

## 🐙 Step 1: GitHub Repository Setup

Make sure your project is pushed to GitHub. Run these terminal commands if you haven't pushed yet:

```bash
# 1. Stage and commit all files (including apps/api/vercel.json)
git add .
git commit -m "feat: configure Vercel deployment for frontend and backend"

# 2. Push to GitHub main branch
git push origin main
```

---

## 🗄️ Step 2: Database Setup (Neon PostgreSQL)

1. Sign up for a free account at [Neon.tech](https://neon.tech) (No credit card required).
2. Create a new project: `jeap-church-db`.
3. Copy your connection strings from the dashboard:
   - **Pooled Connection String** (`DATABASE_URL`) — e.g. `postgresql://neondb_owner:...@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require`
   - **Direct Connection String** (`DIRECT_URL`) — e.g. `postgresql://neondb_owner:...@ep-morning-moon-ax9bp8gw.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require`

---

## 🌐 Step 3: Deploy Next.js Frontend on Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/new) and click **Add New... → Project**.
2. Select your GitHub repository (`jeapmethodist`).
3. Configure Project Settings:
   > [!IMPORTANT]
   > **Root Directory MUST be set to `apps/web`** in Vercel settings. If left as default (`./`), Next.js will fail to resolve CSS and component imports (e.g. `globals.css`).

   - **Project Name**: `jeapmethodist-web`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://jeapmethodist-api.vercel.app/api/v1` *(You will update this after creating Project 2)*
   - `DEFAULT_CURRENCY` = `GHS`
   - `DEFAULT_TIMEZONE` = `Africa/Accra`
5. Click **Deploy**. Vercel will assign your frontend URL (e.g. `https://jeapmethodist-web.vercel.app`).

---

## ⚡ Step 4: Deploy NestJS API Backend on Vercel

You can host the NestJS API as a separate Vercel Serverless Project under the same free Vercel account!

1. Go to [Vercel Dashboard](https://vercel.com/new) and click **Add New... → Project**.
2. Select the **same** GitHub repository (`jeapmethodist`).
3. Configure Project Settings:
   - **Project Name**: `jeapmethodist-api`
   - **Framework Preset**: `Other`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
4. Add Environment Variables:
   - `DATABASE_URL` = `postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require`
   - `DIRECT_URL` = `postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require`
   - `JWT_SECRET` = `YRhmE7bE_jUWddqWhtAIJER0YCRUfSse9xQ09mevXDDS1xWVguoWiFnXJtFilgLT`
   - `JWT_REFRESH_SECRET` = `KvajkTpgSTQJMV3asuqkNU3ftED2iu7tWYbEq7Luh3YhxJ7aB_GBrmU_16RGfPBQ`
   - `CORS_ORIGIN` = `https://jeapmethodist-web.vercel.app`
   - `NODE_ENV` = `production`
   - `API_PREFIX` = `api/v1`
5. Click **Deploy**. Vercel will deploy the NestJS API serverless functions and give you a URL like `https://jeapmethodist-api.vercel.app`.

---

## 🔗 Step 5: Connect Frontend to Backend (CORS & URLs)

Once both Vercel projects are deployed:

1. **Copy your API Vercel URL**: `https://jeapmethodist-api.vercel.app`
2. **Update Frontend Environment Variable**:
   - Open **`jeapmethodist-web`** project settings on Vercel.
   - Go to **Settings → Environment Variables**.
   - Set `NEXT_PUBLIC_API_URL` to `https://jeapmethodist-api.vercel.app/api/v1`.
   - Click **Redeploy**.

3. **Update API CORS Origin**:
   - Open **`jeapmethodist-api`** project settings on Vercel.
   - Go to **Settings → Environment Variables**.
   - Set `CORS_ORIGIN` to your exact frontend domain (`https://jeapmethodist-web.vercel.app`).
   - Click **Redeploy**.

---

## 🛠️ Alternative Backend Options (Koyeb / Render)

If you prefer a persistent Node.js process instead of Vercel Serverless Functions:

| Host | Type | Free Tier Specs | Keep-Alive Strategy |
| :--- | :--- | :--- | :--- |
| **Koyeb** | Persistent | 512 MB RAM, 0.1 vCPU | **Always On ($0)**, no sleeping |
| **Render** | Persistent | 512 MB RAM | Free ping via [cron-job.org](https://cron-job.org) every 5 mins |

---

## 📋 Complete Environment Variables Matrix

### Frontend Project (`jeapmethodist-web`) on Vercel:
```env
NEXT_PUBLIC_API_URL="https://jeapmethodist-api.vercel.app/api/v1"
DEFAULT_CURRENCY="GHS"
DEFAULT_TIMEZONE="Africa/Accra"
```

### Backend Project (`jeapmethodist-api`) on Vercel:
```env
DATABASE_URL="postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require"
JWT_SECRET="YRhmE7bE_jUWddqWhtAIJER0YCRUfSse9xQ09mevXDDS1xWVguoWiFnXJtFilgLT"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="KvajkTpgSTQJMV3asuqkNU3ftED2iu7tWYbEq7Luh3YhxJ7aB_GBrmU_16RGfPBQ"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="production"
API_PREFIX="api/v1"
CORS_ORIGIN="https://jeapmethodist-web.vercel.app"
```

---

## 🛡️ Post-Deployment Verification Checklist

- [x] **`vercel.json` added to `apps/api`**: Configures NestJS serverless routing.
- [x] **Frontend Deployed**: `jeapmethodist-web` live on Vercel.
- [x] **Backend Deployed**: `jeapmethodist-api` live on Vercel.
- [x] **Neon DB Migrated**: All 9 Prisma migrations applied to `jeap-church-db`.
- [x] **CORS Connected**: Frontend and Backend communicating securely over HTTPS.

---

*Guide updated for Methodist Church Ghana Management System — Dual-Project Vercel Hosting.*
