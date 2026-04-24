# Environment Variables Setup Checklist

**What to CREATE in each service to get the env variable values.**

---

## 1. SUPABASE (Database + Auth)

**URL:** https://supabase.com

### What to Create:
- [ ] New Supabase project
- [ ] Select **EU region** (Frankfurt)
- [ ] Confirm database password

### Where to Find Values:
**Settings > API**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` → "Project URL"
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → "anon public"
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → "service_role"

**Settings > Database > Connection String (PostgreSQL)**
- [ ] `DATABASE_URL` → Full connection string

### After Collecting:
```bash
export DATABASE_URL="postgresql://postgres:PASSWORD@db.region.supabase.co:5432/postgres"
pnpm db:push  # Test connection works
```

---

## 2. SANITY.io (CMS)

**URL:** https://sanity.io

### What to Create:
- [ ] New Sanity project
- [ ] Name: `tuscany-cms`
- [ ] Dataset: `production`

### Where to Find Values:
**Project Settings**
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` → "Project ID"
- [ ] `NEXT_PUBLIC_SANITY_DATASET` → Hardcode `production`

**Manage > API > Tokens**
- [ ] Create new token, name: `tuscany-prod`
- [ ] Grant: ✓ Read, ✓ Write, ✓ Assets
- [ ] `SANITY_API_TOKEN` → Copy token

---

## 3. RESEND (Email)

**URL:** https://resend.com

### What to Create:
- [ ] New Resend account
- [ ] Verify email

### Where to Find Values:
**API Tokens**
- [ ] Create new token, name: `tuscany-prod`
- [ ] `RESEND_API_KEY` → Copy token

### Optional (for production email):
- [ ] **Domains** section
- [ ] Add your domain (e.g., `mail.tuscanyplanner.com`)
- [ ] Copy DNS records to your registrar
- [ ] Wait 24–48h for DNS propagation
- [ ] Click "Verify" once propagated

### For Testing Now:
- [ ] Use `onboarding@resend.dev` as test recipient
- [ ] Emails appear in Resend inbox

---

## 4. POSTHOG (Analytics)

**URL:** https://eu.posthog.com (EU Cloud!)

### What to Create:
- [ ] New PostHog account (EU Cloud)
- [ ] New project
- [ ] Select platform: **Next.js**

### Where to Find Values:
**Project Settings > API Keys**
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` → "Project API Key"

---

## 5. SENTRY (Error Tracking)

**URL:** https://sentry.io

### What to Create:
- [ ] New Sentry account
- [ ] New project
- [ ] Select platform: **Next.js**

### Where to Find Values:
**Project Settings > Client Keys (DSN)**
- [ ] `NEXT_PUBLIC_SENTRY_DSN` → Copy DSN

---

## 6. MAPTILER (Maps)

**URL:** https://maptiler.com

### What to Create:
- [ ] New MapTiler account
- [ ] Verify email

### Where to Find Values:
**Account > API Keys**
- [ ] `NEXT_PUBLIC_MAPTILER_KEY` → Copy API Key

---

## 7. SESSION_SECRET (Generate Locally)

### Generate Command:

**Mac/Linux:**
```bash
openssl rand -hex 32
```

**Windows (PowerShell):**
```powershell
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))
```

**Output → `SESSION_SECRET`** (copy the long hex string)

---

## Order of Setup (Fastest Path)

Open these **in parallel** (new browser tabs):

1. https://supabase.com → Create project, collect 4 values
2. https://sanity.io → Create project, create API token, collect 3 values
3. https://resend.com → Create account, create token, collect 1 value
4. https://eu.posthog.com → Create project, collect 1 value
5. https://sentry.io → Create project, collect 1 value
6. https://maptiler.com → Create account, collect 1 value

**Parallel time:** 15–20 min (don't wait for one to finish before starting others)

Then:
7. Open terminal → Generate `SESSION_SECRET`
8. Create `apps/web/.env.local` with all 12 values

---

## Collected Values Template

Copy this, fill in as you go:

```bash
# Supabase (4)
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sanity (3)
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# Resend (1)
RESEND_API_KEY=

# PostHog (1)
NEXT_PUBLIC_POSTHOG_KEY=

# Sentry (1)
NEXT_PUBLIC_SENTRY_DSN=

# MapTiler (1)
NEXT_PUBLIC_MAPTILER_KEY=

# Local (1)
SESSION_SECRET=
```

---

## Next Steps After Collecting

1. **Create file locally:**
```bash
cp .env.example apps/web/.env.local
```

2. **Edit with values:**
```bash
nano apps/web/.env.local
# Paste all 12 values
```

3. **Test connection:**
```bash
export DATABASE_URL="..."
pnpm db:push
```

4. **Run locally:**
```bash
pnpm dev
# Open http://localhost:3000
```

5. **Push to GitHub:**
```bash
git add .
git commit -m "Phase 1: Full web MVP scaffold"
git push origin main
```

6. **Deploy to Vercel:**
```
Visit https://vercel.com
Connect GitHub repo
Add 12 env vars in Project Settings
Deploy
```

---

**Status:** Ready to start collecting. Open those 6 tabs now, then generate SESSION_SECRET. 20 min total.
