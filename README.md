# AuditIQ — AI-Powered Shopify Store Audit Platform

> Get a complete Shopify store audit in 30 seconds. No login required.

---

## Tech Stack

| Layer       | Technology                                              |
|-------------|--------------------------------------------------------|
| Frontend    | Next.js 14, Tailwind CSS, Framer Motion, Three.js, GSAP |
| Backend     | Node.js, Express, BullMQ, Prisma ORM                  |
| Database    | PostgreSQL                                             |
| Cache/Queue | Redis + BullMQ                                         |
| AI          | Google Gemini 1.5 Flash                                     |
| Audit       | Lighthouse, Puppeteer, Cheerio                         |
| Email       | Nodemailer (SMTP/Resend)                               |
| Infra       | Docker Compose, Turbo monorepo                         |

---

## Project Structure

```
shopify-audit/
├── apps/
│   ├── web/                  # Next.js 14 frontend
│   │   ├── app/              # App router pages
│   │   ├── components/
│   │   │   ├── landing/      # Hero, Features, Pricing, FAQ, Testimonials
│   │   │   ├── audit/        # Progress, Dashboard, Issues, Charts
│   │   │   └── ui/           # ScoreRing, GlassCard, ProgressBar, Badge
│   │   └── lib/              # API client, utils
│   └── api/                  # Node.js/Express backend
│       ├── src/
│       │   ├── routes/       # REST API routes
│       │   ├── services/
│       │   │   ├── audit/    # Speed, SEO, Mobile, Security, Analytics, Apps auditors
│       │   │   ├── ai/       # Gemini recommendation engine
│       │   │   └── report/   # PDF generator, Email service
│       │   ├── workers/      # BullMQ job processor
│       │   └── config/       # Logger, Redis connection
│       └── prisma/           # PostgreSQL schema
└── packages/
    └── shared/               # Shared TypeScript types
```

---

## Quick Start

### 1. Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker & Docker Compose

### 2. Clone & Install

```bash
git clone <your-repo>
cd shopify-audit
cp .env.example .env
# Edit .env with your Gemini key and DB credentials
pnpm install
```

### 3. Start Infrastructure

```bash
docker compose up postgres redis -d
```

### 4. Database Migration

```bash
pnpm db:migrate
```

### 5. Dev Servers

```bash
pnpm dev
# API: http://localhost:4000
# Web: http://localhost:3000
```

### 6. Production (Docker)

```bash
docker compose up --build -d
```

---

## Audit Categories

| # | Category                  | Key Metrics                          |
|---|---------------------------|--------------------------------------|
| 1 | Store Speed & Core Web Vitals | LCP, CLS, INP, TTFB, TBT          |
| 2 | Mobile Optimization       | Responsiveness, Tap targets, CLS     |
| 3 | Product Page Performance  | ATC visibility, Schema, Trust badges |
| 4 | Theme Quality             | Age, deprecated methods, bloat       |
| 5 | Collection Optimization   | Filtering UX, lazy loading           |
| 6 | Shopify Apps Audit        | Script weight, duplicate apps        |
| 7 | SEO Performance           | Meta, Schema, Sitemap, Links         |
| 8 | CRO                       | CTAs, Social proof, Checkout flow    |
| 9 | Checkout & Payment        | Speed, Express checkout, Trust       |
|10 | Image & Media             | WebP, lazy loading, size             |
|11 | Analytics & Tracking      | GA4, Meta Pixel, duplicates          |
|12 | Security & Stability      | HTTPS, Headers, Mixed content        |
|13 | Backend Performance       | Liquid, AJAX, App proxy              |
|14 | UX/UI Review              | Hierarchy, A11y, Navigation          |

---

## Environment Variables

See [.env.example](./.env.example) for all required and optional variables.

Required:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_HOST` — Redis host

Optional but recommended:
- `GEMINI_API_KEY` — Enables AI-generated insights (falls back to smart defaults without it)
- `SMTP_HOST` + credentials — Enables email report delivery

---

## API Reference

```
POST   /api/audits              — Start a new audit
GET    /api/audits              — List audit history
GET    /api/audits/:id          — Get audit result (poll for status)
DELETE /api/audits/:id          — Delete an audit
GET    /api/audits/:id/export/pdf — Download PDF report
POST   /api/audits/:id/email    — Send email report
GET    /health                  — Health check
```

---

## Scoring System

| Score  | Grade | Meaning               |
|--------|-------|-----------------------|
| 95-100 | A+    | Exceptional           |
| 85-94  | A     | Strong                |
| 75-84  | B     | Good with room        |
| 60-74  | C     | Needs improvement     |
| 45-59  | D     | Significant issues    |
| 0-44   | F     | Critical problems     |

**Category weights for Overall Score:**
- Performance: 25%
- SEO: 20%
- CRO: 20%
- Mobile: 15%
- UX: 10%
- Security: 10%

---

## Roadmap

### MVP (Now)
- [x] URL-based store scanning
- [x] 14 audit categories
- [x] AI-generated recommendations
- [x] Revenue leak estimation
- [x] PDF export
- [x] Email reports
- [x] Competitor benchmarking
- [x] Audit history dashboard

### v2.0
- [ ] User accounts & authentication
- [ ] Weekly automated monitoring
- [ ] Slack/Discord notifications
- [ ] White-label PDF reports (Agency)
- [ ] Multi-store comparison
- [ ] Shopify app store integration
- [ ] AI chatbot assistant
- [ ] Chrome extension

### v3.0
- [ ] Real-time store monitoring
- [ ] Shopify Partner API integration
- [ ] Custom audit rules
- [ ] Team collaboration
- [ ] API access for agencies

---

## License

MIT — Built for Shopify merchants.
