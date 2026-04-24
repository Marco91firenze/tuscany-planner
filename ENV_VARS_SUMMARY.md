# Environment Variables — Complete List & Setup

## Overview

This app requires **12 environment variables** across **7 third-party services**. Some are public (safe in frontend code), others are secrets (never commit or expose).

**Time to gather all:** ~45 minutes

---

## Quick Checklist

```bash
# After gathering all values, create apps/web/.env.local:
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...          # SECRET
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=skxxx...                     # SECRET
RESEND_API_KEY=re_xxx...                      # SECRET
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx...
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/123
NEXT_PUBLIC_MAPTILER_KEY=xxx...
SESSION_SECRET=xxx...                         # SECRET
```

Then for Vercel: add all to **Project Settings > Environment Variables** (mark secrets as "Encrypted").

---

## Service-by-Service Setup

### 1. **SUPABASE** (Database + Auth)
**Purpose:** PostgreSQL database, user authentication
**Free tier:** Yes (up to 500MB)
**URL:** https://supabase.com

| Var Name | Value From | Public? | Notes |
|----------|-----------|---------|-------|
| `DATABASE_URL` | Settings > Database > Connection String (PostgreSQL) | ❌ SECRET | Format: `postgresql://postgres:PASSWORD@db.region.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings > API > Project URL | ✅ OK | Looks like: `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings > API > anon public | ✅ OK | Long string starting with `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings > API > service_role | ❌ SECRET | Long string starting with `eyJ...` |

**Setup Steps:**
1. Create project at supabase.com
2. Choose EU region (Frankfurt recommended)
3. Go to **Settings > API** → copy 3 keys
4. Go to **Settings > Database > Connection String** → copy full URL to `DATABASE_URL`
5. Locally: run `pnpm db:push` to initialize schema

---

### 2. **SANITY.io** (Content CMS)
**Purpose:** Manage experience catalog without database migrations
**Free tier:** Yes (unlimited documents, 1M API requests/month)
**URL:** https://sanity.io

| Var Name | Value From | Public? | Notes |
|----------|-----------|---------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Project Settings > Project ID | ✅ OK | Short alphanumeric ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Usually `production` | ✅ OK | Hardcode to `production` |
| `SANITY_API_TOKEN` | Manage > API > Tokens (create new) | ❌ SECRET | Looks like `sk6xxx...` |

**Setup Steps:**
1. Create project at sanity.io
2. Go to **Manage > API > Tokens**
3. Click **"Add API token"** → name it `tuscany-prod`
4. Grant ✓ Read, ✓ Write, ✓ Assets permissions
5. Copy token → `SANITY_API_TOKEN`
6. From main project screen, note `Project ID` → `NEXT_PUBLIC_SANITY_PROJECT_ID`

---

### 3. **RESEND** (Transactional Email)
**Purpose:** Send booking confirmations + admin notifications
**Free tier:** Yes (100 emails/day)
**URL:** https://resend.com

| Var Name | Value From | Public? | Notes |
|----------|-----------|---------|-------|
| `RESEND_API_KEY` | API Tokens (create new) | ❌ SECRET | Looks like `re_xxx...` |

**Setup Steps:**
1. Sign up at resend.com
2. Go to **API Tokens**
3. Click **"Create Token"** → name it `tuscany-prod`
4. Copy → `RESEND_API_KEY`
5. **For production:** Add your domain under **Domains** and configure DNS (24–48h)
6. **For testing:** Use Resend's sandbox email `onboarding@resend.dev` → emails appear in your Resend inbox

---

### 4. **POSTHOG** (Product Analytics)
**Purpose:** Track user behavior, funnels, session replays
**Free tier:** Yes (up to 1M events/month)
**URL:** https://eu.posthog.com (EU Cloud!)

| Var Name | Value From | Public? | Notes |
|----------|-----------|---------|-------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Project Settings > API Key | ✅ OK | Looks like `phc_xxx...` |

**Setup Steps:**
1. Sign up at **eu.posthog.com** (EU for GDPR)
2. Create project, select **Next.js** as platform
3. Copy **Project API Key** → `NEXT_PUBLIC_POSTHOG_KEY`
4. Events auto-track on page load; custom events fire from your code

---

### 5. **SENTRY** (Error Tracking)
**Purpose:** Catch bugs in production, send alerts
**Free tier:** Yes (10k errors/month)
**URL:** https://sentry.io

| Var Name | Value From | Public? | Notes |
|----------|-----------|---------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Project Settings > Client Keys (DSN) | ✅ OK | Looks like `https://xxx@xxx.ingest.sentry.io/123` |

**Setup Steps:**
1. Sign up at sentry.io
2. Create new **Project** → select **Next.js**
3. Copy the **DSN** (Client Key) → `NEXT_PUBLIC_SENTRY_DSN`
4. Errors auto-captured; check **Issues** tab in Sentry dashboard

---

### 6. **MAPTILER** (Maps)
**Purpose:** Display experience locations on interactive maps
**Free tier:** Yes (up to 15k vector tiles/month)
**URL:** https://maptiler.com

| Var Name | Value From | Public? | Notes |
|----------|-----------|---------|-------|
| `NEXT_PUBLIC_MAPTILER_KEY` | Account > API Keys | ✅ OK | Short alphanumeric |

**Setup Steps:**
1. Sign up at maptiler.com
2. Go to **Account > API Keys**
3. Copy your **API Key** → `NEXT_PUBLIC_MAPTILER_KEY`

---

### 7. **SESSION_SECRET** (Your App)
**Purpose:** Secure session cookies (admin authentication)
**Free tier:** N/A (generated locally)
**How to Generate:**

**Mac/Linux:**
```bash
openssl rand -hex 32
```

**Windows (PowerShell):**
```powershell
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))
```

Copy output → `SESSION_SECRET`

---

## Where to Put Each Variable

### Local Development (`apps/web/.env.local`)
```bash
# Copy-paste all 12 values here
DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
# ... etc
```

### Vercel Production
1. Go to **Project Settings > Environment Variables**
2. For each var:
   - **Key**: exact name from table above
   - **Value**: the value you gathered
   - **Scope**: "Production" (or "All Environments" for development)
   - **Encryption**: Check "Encrypted" for any var marked ❌ SECRET in the table above
3. Click **"Add"** for each
4. Re-deploy with **"Deploy"** button

---

## Security Best Practices

- ✅ **DO:** Use `.env.local` locally (ignored by git)
- ✅ **DO:** Mark secrets as "Encrypted" in Vercel
- ✅ **DO:** Rotate API keys annually
- ✅ **DO:** Use separate Sanity/Supabase projects for staging vs. production
- ❌ **DON'T:** Commit `.env.local` to git
- ❌ **DON'T:** Paste secrets in Slack/email
- ❌ **DON'T:** Expose service API keys in frontend code (except ones marked ✅)

---

## Testing Variables

Once set, verify they work:

```bash
# Local: Should connect to database
pnpm db:push

# Vercel deployment logs should show no env var errors
# Check: Vercel Dashboard > Deployments > [Latest] > Logs
```

---

## Cost Estimate (Monthly)

| Service | Free Tier | Typical Cost |
|---------|-----------|------------|
| Supabase (DB) | 500MB storage | $25/month at scale |
| Sanity | 1M requests | $99+/month if heavy |
| Resend | 100 emails/day | $20/month at scale |
| PostHog | 1M events | $20/month at scale |
| Sentry | 10k errors | $29/month at scale |
| MapTiler | 15k tiles | $10/month at scale |
| Vercel | 100 GB bandwidth | $20/month at scale |
| **TOTAL** | Free during development | ~$200–250/month at 1k daily active users |

Start on free tiers during MVP. Scale gradually as you add users.

---

## Checklist: Before First Deploy

- [ ] All 12 vars gathered and tested locally
- [ ] `.env.local` created, not committed
- [ ] Supabase schema initialized (`pnpm db:push` succeeded)
- [ ] Sanity project created with `experience` doctype
- [ ] Resend API key active (test email sent)
- [ ] PostHog project created
- [ ] Sentry project created
- [ ] MapTiler key active
- [ ] `SESSION_SECRET` generated (32-byte hex)
- [ ] All 12 vars added to Vercel (secrets marked encrypted)
- [ ] GitHub repo pushed
- [ ] Vercel deployment complete, build logs clean

---

**Ready to deploy?** Follow the **DEPLOYMENT_GUIDE.md** step-by-step.
