# Tuscany Planner

Web app for Florence Premium Tours — luxury experience booking + itinerary planner.

## Stack

- **Frontend:** Next.js 15 (React 19, Server Components, App Router)
- **Backend:** tRPC + Prisma + PostgreSQL (Supabase)
- **CMS:** Sanity.io
- **Monorepo:** pnpm + Turborepo
- **Styling:** Tailwind CSS
- **Email:** Resend
- **Hosting:** Vercel (Frankfurt/EU)
- **Analytics:** PostHog (EU)
- **Error Tracking:** Sentry
- **i18n:** next-intl (9 locales)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+ (local or Supabase)

### Installation

```bash
git clone https://github.com/YOUR_ORG/tuscany-planner
cd tuscany-planner
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

See **Deployment & Environment Variables** section below for detailed setup.

### Development

```bash
pnpm dev
```

Opens http://localhost:3000

### Database

```bash
# Sync schema with database
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
apps/
  web/              # Next.js app (landing, planner, admin)
  studio/           # Sanity Studio (scaffolded, not yet built)

packages/
  core/             # Calendar logic, conflict detection, perk rules
  db/               # Prisma schema + client
  i18n/             # 9-language dictionaries
  ui-tokens/        # Design tokens (colors, typography, spacing)
  api-client/       # tRPC client (scaffolded)
  config/           # Shared configs (scaffolded)
```

## Phase 1 Features (MVP)

- [x] Landing page with trip setup modal
- [x] Calendar-based itinerary planner
- [x] Experience catalog
- [x] Parallel experience bookings
- [x] Participant count tracking
- [x] "All set" driver perk reveal
- [x] Inquiry submission form
- [x] Minimal admin dashboard
- [x] tRPC API layer
- [x] Prisma data model
- [x] 9-language i18n infrastructure
- [ ] Email notifications (Resend integration)
- [ ] Sanity CMS setup + experience sync
- [ ] Analytics (PostHog) setup
- [ ] Error tracking (Sentry) setup
- [ ] Deployment to Vercel

## Deployment & Environment Variables

### 1. Create Service Accounts

#### Supabase (Database + Auth)
1. Go to https://supabase.com
2. Create new project (EU region recommended)
3. Copy from **Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` → service role key (keep secret)
4. Under **Database > Connection Pooling**, use that string as `DATABASE_URL`

#### Sanity.io (CMS)
1. Go to https://sanity.io
2. Create new project
3. Create API token with read+write permissions
4. Copy:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` → Project ID
   - `NEXT_PUBLIC_SANITY_DATASET` → typically `production`
   - `SANITY_API_TOKEN` → API token (keep secret)

#### Resend (Email)
1. Go to https://resend.com
2. Create account, verify domain
3. Copy `RESEND_API_KEY` from Settings

#### PostHog (Analytics)
1. Go to https://posthog.com (EU Cloud)
2. Create new project
3. Copy `NEXT_PUBLIC_POSTHOG_KEY` from settings

#### Sentry (Error Tracking)
1. Go to https://sentry.io
2. Create new org + project (Next.js)
3. Copy `NEXT_PUBLIC_SENTRY_DSN`

#### MapTiler (Maps)
1. Go to https://maptiler.com
2. Create account, get API key
3. Copy `NEXT_PUBLIC_MAPTILER_KEY`

### 2. Local Development

Create `apps/web/.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tuscany
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=xxx
RESEND_API_KEY=xxx
NEXT_PUBLIC_POSTHOG_KEY=xxx
NEXT_PUBLIC_SENTRY_DSN=xxx
NEXT_PUBLIC_MAPTILER_KEY=xxx
SESSION_SECRET=$(openssl rand -hex 32)
```

### 3. Deploy to Vercel

```bash
pnpm install -g vercel
vercel
```

Follow prompts. Then add env vars in **Vercel Dashboard > Settings > Environment Variables**:

Copy each `XXX=yyy` line from `.env.example` (except `DATABASE_URL` which should be set in Supabase directly).

## Open Questions Pending Resolution

(From PRD §10)

1. Driver perk scope: exact hours/day, airport transfers?
2. Participant caps: min/max for each experience
3. Multi-day yacht spec: default days, price tiers
4. Availability source: operator tracking method
5. Hotel partnerships: co-branded pages?
6. Brand assets: colors, fonts, logo finalized?
7. Domain: .it or .com?
8. Legal: DPAs signed with vendors?
9. Translation budget: specialist agencies for RU/ZH/JA?
10. Sales workflow: CRM integration needed?

## License

Proprietary — Florence Premium Tours Srl

## Support

contact@florencepremiumtours.com
