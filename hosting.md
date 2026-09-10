# 🌐 100% FREE & UNLIMITED VERCEL HOSTING GUIDE ($0/Month Forever)

This guide provides the exact setup for hosting **BOTH the Next.js Frontend AND the NestJS API Backend on Vercel** under a single **100% free** account with zero monthly costs ($0/mo forever).

---

## 🎯 Target Production Domains

| Component                    | Vercel Project Name  | Production URL                          |
| :--------------------------- | :------------------- | :-------------------------------------- |
| **Frontend Web App**   | `jeapmethodist`    | `https://jeapmethodist.vercel.app`    |
| **Backend NestJS API** | `jeapmethodistapi` | `https://jeapmethodistapi.vercel.app` |

---

## 💎 The 100% Free All-on-Vercel Architecture

| Service Layer                  | Platform                                          | Free Tier Allowances                                         | Cost                 |
| :----------------------------- | :------------------------------------------------ | :----------------------------------------------------------- | :------------------- |
| **Code Repository**      | **GitHub**                                  | Unlimited public/private repos, free GitHub Actions CI/CD    | **$0.00 / mo** |
| **Frontend Web App**     | **Vercel Project 1** (`jeapmethodist`)    | Unlimited deployments, 100 GB/mo bandwidth, global CDN, SSL  | **$0.00 / mo** |
| **Backend NestJS API**   | **Vercel Project 2** (`jeapmethodistapi`) | Serverless Node.js functions, instant scaling, SSL           | **$0.00 / mo** |
| **Database**             | **Neon.tech**                               | Serverless PostgreSQL (500 MB DB, Pooled connections)        | **$0.00 / mo** |
| **File / Media Storage** | **Cloudflare R2** or **Supabase**     | 10 GB storage, 0 egress fees (unlimited bandwidth downloads) | **$0.00 / mo** |

---

## 📑 Quick Navigation

1. [Step 1: GitHub Repository Setup](#step-1-github-repository-setup)
2. [Step 2: Database Setup (Neon PostgreSQL)](#step-2-database-setup-neon-postgresql)
3. [Step 3: Deploy Next.js Frontend (`jeapmethodist`)](#step-3-deploy-nextjs-frontend-jeapmethodist)
4. [Step 4: Deploy NestJS API Backend (`jeapmethodistapi`)](#step-4-deploy-nestjs-api-backend-jeapmethodistapi)
5. [Step 5: Connect Frontend to Backend (CORS &amp; URLs)](#step-5-connect-frontend-to-backend-cors--urls)
6. [Complete Environment Variables Matrix](#complete-environment-variables-matrix)
7. [Post-Deployment Verification Checklist](#post-deployment-verification-checklist)

---

## 🐙 Step 1: GitHub Repository Setup

Make sure your project is pushed to GitHub. Run these terminal commands if you haven't pushed yet:

```bash
# 1. Stage and commit all files (including apps/api/vercel.json)
git add .
git commit -m "feat: configure Vercel deployment for jeapmethodist and jeapmethodistapi"

# 2. Push to GitHub main branch
git push origin main
```

---

## 🗄️ Step 2: Database Setup (Neon PostgreSQL)

Your Neon PostgreSQL database is already configured and synced:

- **Pooled Connection String** (`DATABASE_URL`): `postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require`
- **Direct Connection String** (`DIRECT_URL`): `postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require`

---

## 🌐 Step 3: Deploy Next.js Frontend (`jeapmethodist`)

1. Log into your [Vercel Dashboard](https://vercel.com/new) and click **Add New... → Project**.
2. Select your GitHub repository (`jeapmethodist`).
3. Configure Project Settings:

   > [!IMPORTANT]
   > **Root Directory MUST be set to `apps/web`** in Vercel settings.
   >

   - **Project Name**: `jeapmethodist`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. Add Environment Variables:

   - `NEXT_PUBLIC_API_URL` = `https://jeapmethodistapi.vercel.app/api/v1`
   - `DEFAULT_CURRENCY` = `GHS`
   - `DEFAULT_TIMEZONE` = `Africa/Accra`
5. Click **Deploy**. Vercel will deploy to: **`https://jeapmethodist.vercel.app`**.

---

## ⚡ Step 4: Deploy NestJS API Backend (`jeapmethodistapi`)

Host your NestJS API as a second Vercel Serverless Project under the same free account:

1. Go to [Vercel Dashboard](https://vercel.com/new) and click **Add New... → Project**.
2. Select the **same** GitHub repository (`jeapmethodist`).
3. Configure Project Settings:
   - **Project Name**: `jeapmethodistapi`
   - **Framework Preset**: `Other`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
4. Add Environment Variables:
   - `DATABASE_URL` = `postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require`
   - `DIRECT_URL` = `postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require`
   - `JWT_SECRET` = `YRhmE7bE_jUWddqWhtAIJER0YCRUfSse9xQ09mevXDDS1xWVguoWiFnXJtFilgLT`
   - `JWT_REFRESH_SECRET` = `KvajkTpgSTQJMV3asuqkNU3ftED2iu7tWYbEq7Luh3YhxJ7aB_GBrmU_16RGfPBQ`
   - `CORS_ORIGIN` = `https://jeapmethodist.vercel.app`
   - `NODE_ENV` = `production`
   - `API_PREFIX` = `api/v1`
5. Click **Deploy**. Vercel will deploy your API serverless functions to: **`https://jeapmethodistapi.vercel.app`**.

---

## 🔗 Step 5: Connect Frontend to Backend (CORS & URLs)

Once both Vercel projects are deployed:

1. **Frontend Environment Variable (`jeapmethodist`)**:

   - In `jeapmethodist` Vercel Settings → Environment Variables:
   - Verify `NEXT_PUBLIC_API_URL` is set to `https://jeapmethodistapi.vercel.app/api/v1`.
2. **API Environment Variable (`jeapmethodistapi`)**:

   - In `jeapmethodistapi` Vercel Settings → Environment Variables:
   - Verify `CORS_ORIGIN` is set to `https://jeapmethodist.vercel.app`.

---

## 📋 Complete Environment Variables Matrix

### 1. Frontend Project (`jeapmethodist`) on Vercel:

```env
NEXT_PUBLIC_API_URL="https://jeapmethodistapi.vercel.app/api/v1"
DEFAULT_CURRENCY="GHS"
DEFAULT_TIMEZONE="Africa/Accra"
```

### 2. Backend Project (`jeapmethodistapi`) on Vercel:

```env
DATABASE_URL="postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require"
JWT_SECRET="YRhmE7bE_jUWddqWhtAIJER0YCRUfSse9xQ09mevXDDS1xWVguoWiFnXJtFilgLT"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="KvajkTpgSTQJMV3asuqkNU3ftED2iu7tWYbEq7Luh3YhxJ7aB_GBrmU_16RGfPBQ"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="production"
API_PREFIX="api/v1"
CORS_ORIGIN="https://jeapmethodist.vercel.app"
```

---

## 🛡️ Post-Deployment Verification Checklist

- [X] **`apps/api/vercel.json` Present**: Serverless API routes configured.
- [X] **Frontend Deployed (`jeapmethodist`)**: Live on `https://jeapmethodist.vercel.app`.
- [X] **Backend Deployed (`jeapmethodistapi`)**: Live on `https://jeapmethodistapi.vercel.app`.
- [X] **Neon Database Connected**: Both projects configured with your Neon PostgreSQL strings.
- [X] **CORS Configured**: Secure cross-origin requests allowed between `jeapmethodist.vercel.app` and `jeapmethodistapi.vercel.app`.

---

*Guide updated for Methodist Church Ghana Management System — Vercel Domains Setup.*
