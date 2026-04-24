# 🚀 First Steps — Phase 1 Complete!

Your Tuscany Planner Phase 1 is **scaffolded and ready to test**. This file tells you exactly what to do next.

---

## What's Done ✅

- Monorepo structure (pnpm + Turborepo)
- Next.js web app (landing page, planner, submission forms)
- tRPC API layer (type-safe RPC)
- Prisma database schema (Trip, Experience, ItineraryItem, Inquiry, AdminUser)
- Calendar logic (conflict detection, perk reveal)
- 9-language i18n infrastructure
- Tailwind CSS + design tokens
- Email templates scaffolded (Resend integration ready)
- GitHub Actions CI/CD pipeline
- Vercel deployment config

---

## What You Need to Do (Next 2-3 Hours)

### 1️⃣ Create Third-Party Service Accounts (30 min)

Follow **ENV_VARS_SUMMARY.md** step-by-step. You need accounts for:

- [ ] **Supabase** (database) → get `DATABASE_URL` + 3 keys
- [ ] **Sanity.io** (CMS) → get project ID + API token
- [ ] **Resend** (email) → get API key
- [ ] **PostHog** (analytics) → get API key
- [ ] **Sentry** (error tracking) → get DSN
- [ ] **MapTiler** (maps) → get API key
- [ ] **Generate `SESSION_SECRET`** locally

### 2️⃣ Set Up Local Environment (10 min)

```bash
# In repo root:
cp .env.example apps/web/.env.local

# Edit apps/web/.env.local and paste all 12 values from accounts above
nano apps/web/.env.local  # or your editor
```

### 3️⃣ Initialize Database Locally (5 min)

```bash
export DATABASE_URL="postgresql://..."  # from Supabase

# Check connection + create schema
pnpm db:push
```

### 4️⃣ Test Locally (10 min)

```bash
# Start dev server
pnpm dev

# Open http://localhost:3000
# Test:
# 1. Click "Start Planning"
# 2. Fill dates + party size
# 3. Submit → should create trip in database
# 4. Planner page should load (calendar empty)
```

### 5️⃣ Push to GitHub (5 min)

```bash
git add .
git commit -m "Phase 1: Full web MVP scaffold - landing, planner, tRPC API, Prisma schema"
git push origin main
```

### 6️⃣ Deploy to Vercel (30 min)

Follow **DEPLOYMENT_GUIDE.md** step-by-step:

1. Connect GitHub repo to Vercel
2. Add 12 env vars in Vercel Dashboard
3. Trigger deployment
4. Test at `https://your-project.vercel.app`

---

## Immediate Next Steps (Phase 2 Planning)

### What Still Needs Implementation

- [ ] **Sanity Studio** integration (scaffold exists, needs schemas)
- [ ] **Email sending** (templates exist, needs Resend wiring)
- [ ] **Analytics events** (PostHog SDK ready, events need to fire)
- [ ] **Error tracking** (Sentry SDK ready, needs wiring)
- [ ] **Map component** (MapTiler key ready, component not yet built)
- [ ] **Experience catalog real data** (Sanity integration needed)
- [ ] **Admin dashboard full CRUD** (basic endpoints exist, UI needs expansion)
- [ ] **Parallel track UI** (calendar allows multiple items, UI needs refinement)
- [ ] **i18n translations** (9 language scaffold ready, strings need human translation)
- [ ] **Landing page polish** (MVP works, design needs refinement with brand assets)

### What User Must Provide

- [ ] **Brand assets**: logo, color palette finalized, fonts locked
- [ ] **Legal docs**: privacy policy, terms of service, cookie policy
- [ ] **Experience catalog data**: 11 experiences with descriptions, photos, pricing (can be in Sanity after setup)
- [ ] **Translations**: RU, ZH, JA require specialist translators (budget ~$1500–2500)
- [ ] **Decisions**: driver perk scope, participant caps, multi-day yacht spec (see PRD §10)

---

## File Structure Overview

```
📦 tuscany-planner
├─ 📄 README.md                 ← Start here for dev info
├─ 📄 ENV_VARS_SUMMARY.md       ← Setup all service accounts
├─ 📄 DEPLOYMENT_GUIDE.md       ← Deploy to Vercel
├─ 📄 FIRST_STEPS.md            ← You are here
│
├─ 📁 apps/
│  ├─ web/                      ← Next.js app (prod-ready MVP)
│  │  ├─ app/
│  │  │  ├─ page.tsx           ← Landing page
│  │  │  ├─ plan/[tripId]/     ← Calendar planner
│  │  │  ├─ submit/[tripId]/   ← Inquiry form
│  │  │  ├─ api/trpc/[trpc]/   ← tRPC endpoint
│  │  │  └─ globals.css        ← Tailwind
│  │  ├─ server/
│  │  │  ├─ routers/           ← tRPC routes
│  │  │  └─ trpc.ts            ← tRPC setup
│  │  └─ lib/
│  │     ├─ email-templates.tsx ← Email HTML
│  │     └─ trpc.ts            ← Client wrapper
│  └─ studio/                   ← Sanity Studio (empty scaffold)
│
├─ 📁 packages/
│  ├─ core/                     ← Calendar logic, perk rules
│  ├─ db/                       ← Prisma schema + migrations
│  ├─ i18n/                     ← 9-language dictionaries
│  ├─ ui-tokens/                ← Design system (colors, spacing)
│  └─ config/                   ← Shared tsconfig, eslint (scaffold)
│
├─ 📁 .github/
│  └─ workflows/deploy.yml      ← GitHub Actions → Vercel
│
├─ package.json                 ← Root monorepo config
├─ pnpm-workspace.yaml          ← Workspace definition
├─ turbo.json                   ← Build orchestration
├─ tsconfig.json                ← Shared TS config
├─ tailwind.config.ts           ← CSS framework config
├─ vercel.json                  ← Vercel env + build config
└─ .env.example                 ← Template for env vars
```

---

## Common Issues & Fixes

### `pnpm install` fails
```bash
# Clear cache and retry
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### `DATABASE_URL` connection error
- Check Supabase project is running (goes into "paused" if unused for 7 days)
- Verify password in connection string has special chars escaped
- Test: `psql $DATABASE_URL -c "SELECT 1"`

### Planner page shows blank
- Check browser console (F12 > Console tab) for errors
- Verify `DATABASE_URL` is set locally
- Try: `pnpm db:push` again to ensure schema exists

### Build fails on Vercel
- Check **Deployments > [Failed] > Logs** for error message
- Most common: missing env var (check Vercel dashboard has all 12)
- Try: rebuild with same commit (`Redeploy` button in Vercel)

---

## Testing Checklist

Before sharing with stakeholders:

- [ ] **Landing page** loads, no console errors
- [ ] **Trip creation** works (fill dates → submit)
- [ ] **Planner page** loads with empty calendar
- [ ] **Database** has new Trip record (`pnpm db:studio` → browse)
- [ ] **tRPC API** responds (`curl http://localhost:3000/api/trpc/trip.list`)
- [ ] **Vercel preview** builds and deploys (after pushing main)
- [ ] **No 5xx errors** in logs

---

## Time Estimates

| Task | Time | Who |
|------|------|-----|
| Service account setup | 30 min | You |
| Local env + db init | 15 min | You |
| Local testing | 10 min | You |
| GitHub push | 5 min | You |
| Vercel deployment | 30 min | You |
| **TOTAL** | **1.5 hours** | — |

---

## Next Phase (Phase 2 — Hardening)

Once deployed, Phase 2 focuses on:

1. **Experience catalog** via Sanity CMS
2. **Email notifications** (Resend integration)
3. **Analytics dashboard** (PostHog events)
4. **Admin experience CRUD** (full UI)
5. **Parallel track UX** refinement
6. **Performance tuning** (Lighthouse CI)
7. **i18n human translations** (FR, DE, ES, PT, RU, ZH, JA)

---

## Getting Help

### Docs to Consult

1. **README.md** — Dev overview, scripts, architecture
2. **ENV_VARS_SUMMARY.md** — Every variable explained
3. **DEPLOYMENT_GUIDE.md** — Step-by-step Vercel setup
4. **PRD at `.claude/plans/`** — Product spec, requirements

### When Stuck

1. Check **Vercel Logs** (Deployments > Latest > Logs)
2. Check **Sentry Dashboard** (production errors)
3. Check **service status pages** (Supabase, Sanity, etc.)
4. Search error message + service name on Google
5. Ask in service's community or support

---

## Success! 🎉

Once Vercel is live:

- [x] Phase 1 complete
- [x] Web MVP deployed to production
- [x] Ready for Phase 2 hardening
- [x] Ready for stakeholder testing

**Next:** Gather feedback, refine UX, then tackle Phase 2.

---

**Questions?** Refer to the relevant guide above or check the PRD in `.claude/plans/caveman-mode-on-tranquil-tarjan.md`.

Now go set up those accounts! 💪
