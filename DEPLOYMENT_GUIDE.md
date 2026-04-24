# Deployment & Environment Variables Guide

Complete walkthrough to get Tuscany Planner from your laptop to production on Vercel.

## Before You Start

- GitHub account (for code repo)
- Vercel account (for hosting)
- Credit card (some services have free tiers, but metered billing applies)

**Estimated setup time:** 45–60 minutes

---

## Step 1: Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Phase 1 monorepo scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB/tuscany-planner.git
git push -u origin main
```

---

## Step 2: Set Up Supabase (Database + Auth)

### Create Project

1. Go to https://supabase.com
2. Click **"New Project"**
3. **Organization**: Create new or select existing
4. **Project Name**: `tuscany-production`
5. **Database Password**: Generate strong password (save it!)
6. **Region**: Select EU (Frankfurt or Ireland) for GDPR
7. Click **"Create new project"** (takes ~2 min)

### Get Connection Credentials

8. Go to **Settings > API** (left sidebar)
9. Note these three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`
10. Go to **Settings > Database**
11. Copy the **"Connection string"** (PostgreSQL tab) → `DATABASE_URL`
    - Format: `postgresql://postgres:[PASSWORD]@db.[REGION].supabase.co:5432/postgres`

### Initialize Database Schema

12. In your local repo:
```bash
# Set DATABASE_URL locally
export DATABASE_URL="postgresql://..."  # paste from step 11

# Push Prisma schema
pnpm db:push
```

---

## Step 3: Set Up Sanity.io (CMS)

### Create Project

1. Go to https://sanity.io
2. Click **"Create Project"**
3. **Project Name**: `tuscany-cms`
4. **Dataset**: `production`
5. Click **"Create"**

### Create API Token

6. Go to **Manage > API** (left sidebar)
7. Under **Tokens**, click **"Add API token"**
8. **Name**: `tuscany-nextjs-prod`
9. **Permissions**: Check ✓ Read, Write, Assets
10. Copy the token → `SANITY_API_TOKEN` (keep secret)

### Get Project ID

11. In **Project settings**, find **Project ID** → `NEXT_PUBLIC_SANITY_PROJECT_ID`
12. Dataset is `production` → `NEXT_PUBLIC_SANITY_DATASET`

### Bootstrap Experience Schema (Manual for Now)

This step will be automated later. For MVP:

13. Go to **Sanity Studio** (click "Open" in the project)
14. Create a **New Document Type** called `experience`
15. Add fields:
    - `_id` (auto)
    - `slug` (string, unique)
    - `titleEn`, `titleIt`, `titleFr`, ... (9 text fields for i18n)
    - `durationClass` (select: HALF_DAY, FULL_DAY, EVENING, FLEXIBLE, MULTI_DAY)
    - `minParticipants`, `maxParticipants` (numbers)
    - `category` (select: food, wine, driving, outdoor, water, shopping, aerial, cultural)
    - `heroImage` (image)
    - `isActive` (boolean)

---

## Step 4: Set Up Resend (Transactional Email)

### Create Account

1. Go to https://resend.com
2. Sign up with email
3. Verify email

### Verify Domain (Production)

4. Go to **Domains** (left sidebar)
5. Click **"Add Domain"**
6. Enter your domain (e.g., `mail.tuscanyplanner.com`)
7. Copy the **DNS records** provided
8. Add those records to your domain registrar's DNS settings
9. Click **"Verify"** (may take 24–48h for DNS propagation)

### Get API Key

10. Go to **API Tokens** (left sidebar)
11. Click **"Create Token"**
12. **Name**: `tuscany-production`
13. Copy the token → `RESEND_API_KEY` (keep secret)

**For development (before domain is ready):** Use Resend's test email `onboarding@resend.dev` — emails will be sent to your Resend dashboard inbox instead.

---

## Step 5: Set Up PostHog (Analytics)

### Create Project

1. Go to https://eu.posthog.com (EU Cloud)
2. Sign up
3. Create new Project: `Tuscany Planner`
4. Select **Next.js** as your platform

### Get API Key

5. Copy the **Project API Key** → `NEXT_PUBLIC_POSTHOG_KEY`

---

## Step 6: Set Up Sentry (Error Tracking)

### Create Project

1. Go to https://sentry.io
2. Sign up / log in
3. Click **"Create Project"**
4. **Platform**: Select **Next.js**
5. **Team**: Create or select
6. Click **"Create Project"**

### Get DSN

7. Copy the **DSN** (Client Key) → `NEXT_PUBLIC_SENTRY_DSN`

---

## Step 7: Set Up MapTiler (Maps)

### Create Account

1. Go to https://maptiler.com
2. Sign up
3. Go to **Account > API Keys**
4. Copy your **API Key** → `NEXT_PUBLIC_MAPTILER_KEY`

---

## Step 8: Generate Session Secret

```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (PowerShell)
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))
```

Copy output → `SESSION_SECRET`

---

## Step 9: Configure Vercel Deployment

### Connect GitHub

1. Go to https://vercel.com
2. Click **"New Project"**
3. **Import Repository**: Select your GitHub repo
4. Click **"Import"**

### Add Environment Variables

5. In **Project Settings > Environment Variables**, add each of these:

| Key | Value | Type |
|-----|-------|------|
| `DATABASE_URL` | `postgresql://...` from Supabase | System |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Settings | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase Settings | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Settings | **Encrypted** |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | From Sanity | Production |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Production |
| `SANITY_API_TOKEN` | From Sanity API Tokens | **Encrypted** |
| `RESEND_API_KEY` | From Resend API Tokens | **Encrypted** |
| `NEXT_PUBLIC_POSTHOG_KEY` | From PostHog | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | From Sentry | Production |
| `NEXT_PUBLIC_MAPTILER_KEY` | From MapTiler | Production |
| `SESSION_SECRET` | Generated in Step 8 | **Encrypted** |

**Important:** Click **"Encrypted"** for keys marked above.

### Deploy

6. Vercel auto-detects Next.js and builds automatically
7. Once build completes, you'll get a `.vercel.app` URL
8. Open it to test!

---

## Step 10: Set Up Custom Domain (Optional)

1. In **Vercel Project Settings > Domains**
2. Click **"Add Domain"**
3. Enter your domain
4. Follow DNS setup instructions
5. Click **"Verify"**

---

## Step 11: Test Deployment

Visit your Vercel URL:

1. **Landing page loads** ✓
2. **Click "Start Planning"** ✓
3. **Fill trip dates, submit** → Trip created ✓
4. **Planner page loads with calendar** ✓
5. Check **Vercel Logs** for errors:
   - Vercel Dashboard > **Deployments** > Latest > **Logs**

---

## Troubleshooting

### Build fails: "Module not found: @tuscany/xxx"

- Verify pnpm workspaces in root `package.json`
- Ensure each package has `exports` in its `package.json`
- Try: `pnpm install` again locally, then push

### Database connection error

- Verify `DATABASE_URL` is correct (check for typos)
- In Vercel, ensure env var is marked "All Environments"
- Test locally: `pnpm db:push` should work

### Sanity queries return empty

- Ensure `SANITY_API_TOKEN` has Read + Write permissions
- Check Sanity **project ID** matches `NEXT_PUBLIC_SANITY_PROJECT_ID`
- Verify at least one `experience` document exists in Sanity

### Emails not sending (Resend)

- Check Resend **API Key** is correct and active
- For testing: use `onboarding@resend.dev` as recipient
- Check Resend **Logs** tab for delivery status
- Domain must be verified for production use

### PostHog not recording events

- Verify `NEXT_PUBLIC_POSTHOG_KEY` is correct
- Check browser console for errors
- Events should appear in PostHog **Events** tab within 60 seconds

---

## Post-Deployment Checklist

- [ ] Landing page loads
- [ ] Trip creation works
- [ ] Calendar planner displays
- [ ] Inquiry form submits (check email backend logs)
- [ ] Admin dashboard loads
- [ ] Error tracking captures errors (check Sentry)
- [ ] Analytics events fire (check PostHog)
- [ ] Database backups enabled (Supabase: go to **Settings > Backups**)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate auto-renewed (Vercel handles this)
- [ ] GitHub branch protection + PR checks configured

---

## Production Tips

### Backups

- Supabase: Auto-backups enabled, point-in-time recovery available
- Keep `pnpm-lock.yaml` in git (reproducible installs)

### Monitoring

- Set up Vercel alerts for failed deployments
- Monitor Sentry daily for errors
- Check PostHog dashboards weekly for funnel metrics

### Updates

- Pin dependency versions in `package.json`
- Test major updates in a preview deployment first
- Keep Next.js, Prisma, tRPC up to date (monthly)

---

## Support

If something breaks:

1. Check **Vercel Logs** (Deployments > Latest > Logs)
2. Check **Sentry** for error details
3. Check individual service dashboards (Supabase, Sanity, etc.)
4. Google the error message + service name
5. Contact service support if stuck

---

**You're live!** 🎉

Next: Test real user flows, collect feedback, then move to Phase 2 (hardening + revenue ops).
