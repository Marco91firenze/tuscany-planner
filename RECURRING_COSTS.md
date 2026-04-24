# Recurring Costs — Service Breakdown

Monthly estimates at different scale levels.

---

## Cost Summary

| Service | Free Tier | MVP | Small Prod | Scale (1k DAU) |
|---------|-----------|-----|-----------|----------------|
| **Supabase** (DB) | 500MB | $0 | $25 | $100+ |
| **Sanity** (CMS) | 1M API req | $0 | $99 | $200+ |
| **Resend** (Email) | 100/day | $0 | $20 | $50 |
| **PostHog** (Analytics) | 1M events | $0 | $20 | $100+ |
| **Sentry** (Errors) | 10k events | $0 | $29 | $99 |
| **MapTiler** (Maps) | 15k tiles | $0 | $10 | $50+ |
| **Vercel** (Hosting) | 100GB BW | $0 | $20 | $100+ |
| **TOTAL** | Free | **$0** | **$203** | **$700+** |

---

## Per-Service Breakdown

### 1. **Supabase** (Database + Auth)

| Tier | Cost | Storage | Bandwidth | Users | Good For |
|------|------|---------|-----------|-------|----------|
| Free | $0 | 500 MB | 2 GB/mo | Unlimited | MVP, testing |
| Pro | $25 | 8 GB | 50 GB/mo | Unlimited | 100–1k trips/mo |
| Team | $599/mo | Unlimited | Unlimited | 10 team members | Enterprise |

**Estimate for Tuscany:** MVP on free, move to Pro when >100 trips/month.

---

### 2. **Sanity.io** (CMS)

| Tier | Cost | API Requests | Docs | Good For |
|------|------|--------------|------|----------|
| Free | $0 | 1M/mo | Unlimited | MVP, small teams |
| Growth | $99/mo | 10M/mo | Unlimited | 100+ trips/mo |
| Pro | $299/mo | 100M/mo | Unlimited | Heavy use |

**Estimate for Tuscany:** Free until CMS traffic explodes. 11 experiences = negligible load.

---

### 3. **Resend** (Transactional Email)

| Tier | Cost | Emails/mo | Good For |
|------|------|-----------|----------|
| Free | $0 | 100/day (3k/mo) | MVP, testing |
| Pro | $20/mo | 150k | 50–200 bookings/mo |
| Scale | $0.35 per 1k | Unlimited | 1k+ emails/mo |

**Estimate for Tuscany:**
- 100 trips/mo × 2 emails/trip (tourist + operator) = 200 emails. Free tier covers.
- 1k trips/mo = $7/mo (scale pricing).

---

### 4. **PostHog** (Product Analytics)

| Tier | Cost | Events/mo | Good For |
|------|------|-----------|----------|
| Free | $0 | 1M/mo | MVP, small projects |
| Paid | $20–200/mo | Overage at $0.0001/event | Scale |

**Estimate for Tuscany:**
- 100 daily active users × 20 events/day × 30 days = 60k events. Free tier.
- 1k DAU × 20 events/day = 600k events. Still under 1M. Free.
- 10k DAU → ~6M events. $20/mo.

---

### 5. **Sentry** (Error Tracking)

| Tier | Cost | Errors/mo | Good For |
|------|------|-----------|----------|
| Free | $0 | 10k/mo | MVP, testing |
| Paid | $29/mo | 150k | 100–1k users |
| Scale | $0.50 per 10k | Unlimited | High-traffic apps |

**Estimate for Tuscany:**
- 100 daily active users, 1% error rate → 3k errors/mo. Free.
- 1k DAU, 0.5% error rate → 15k errors/mo. Still free (10k threshold).
- Unlikely to exceed free tier unless bugs exist.

---

### 6. **MapTiler** (Maps)

| Tier | Cost | Tiles/mo | Good For |
|------|------|----------|----------|
| Free | $0 | 15k/mo | MVP, testing |
| Paid | $10/mo | 250k | 100–1k users |
| Scale | $0.60 per 1k tiles | Unlimited | Heavy use |

**Estimate for Tuscany:**
- 100 trips/mo × 5 map views/trip = 500 tiles. Free.
- 1k trips × 10 views = 10k tiles. Free.
- 10k trips × 20 views = 200k tiles. Free tier + $10/mo overages.

---

### 7. **Vercel** (Hosting)

| Tier | Cost | Bandwidth | Domains | Good For |
|------|------|-----------|---------|----------|
| Free | $0 | 100 GB/mo | 1 | MVP, testing |
| Pro | $20/mo | 1 TB | Unlimited | 100–1k users |
| Enterprise | Custom | Unlimited | Unlimited | Scale |

**Estimate for Tuscany:**
- 100 daily active users × 1 MB/visit × 30 days = 3 GB. Free.
- 1k DAU × 2 MB/visit = 60 GB. Free.
- 10k DAU → 600 GB. $20/mo (Pro tier).

---

## Scenario: Launch → Scale

### Month 1–3 (MVP Testing)
- **Total cost:** $0
- Running on free tiers across all services
- Trip volume: 0–20/mo
- Daily active users: 0–50

### Month 4–6 (Early Traction)
- **Total cost:** $100–150/mo
- Upgrade Supabase to Pro ($25)
- Add Sanity Growth tier ($99)
- Rest still free
- Trip volume: 50–150/mo
- Daily active users: 100–300

### Month 7–12 (Small Production)
| Service | Cost |
|---------|------|
| Supabase Pro | $25 |
| Sanity Growth | $99 |
| Resend | $20 |
| PostHog | $20 |
| Sentry | $0 (free) |
| MapTiler | $0 (free) |
| Vercel Pro | $20 |
| **TOTAL** | **$184/mo** |

- Trip volume: 200–500/mo
- Daily active users: 500–1k
- Revisions: Supabase → $100+, Sanity → growth tier stabilizes

### Year 2+ (Scaling)
| Service | Cost |
|---------|------|
| Supabase Team | $100–500 |
| Sanity Pro | $200–500 |
| Resend | $50–200 |
| PostHog | $100–500 |
| Sentry | $50–200 |
| MapTiler | $50–200 |
| Vercel | $100–500 |
| **TOTAL** | **$650–2500/mo** |

- Trip volume: 1k+/mo
- Daily active users: 5k–50k+
- Costs scale with usage (mostly variable, not fixed)

---

## Cost Optimization Tips

### Free-Tier Stretching
- Cache API responses (tRPC, Sanity) → reduce API calls by 80%
- Compress images → reduce bandwidth
- Batch analytics events → fewer requests
- Sample errors in Sentry (log 50% of 5xx errors)

### Negotiation Points
- Sanity: 20% discount for non-profits / educational orgs
- Vercel: can negotiate custom pricing >$10k/mo spend
- MapTiler: volume discounts >1M tiles/mo

### Cost Caps
- Set Vercel billing alerts (auto-stops at threshold)
- Set Supabase auto-pause (pauses after 7 days inactivity)
- Set PostHog data sampling (drop sample % as volume grows)

---

## What's NOT Charged

- GitHub (unlimited public/private repos, free for personal use)
- Sentry (free tier generous; only scales cost at extreme error volume)
- Your infrastructure time (developer effort)
- Domain registration ($15–20/yr, not subscription-based)

---

## Bottom Line

**MVP to production:** $0–200/mo.  
**Scaling (10k DAU):** $700–1500/mo.  
**At 100k DAU:** $5k–15k/mo.

All costs are variable + usage-based. No surprises. Can pause anything immediately.

Compare: OTA commissions are 15–30% of booking value. Even at $500/mo cost, you'd need $2–3 bookings/month to justify.

---

**Pay as you grow. Nothing scary.**
