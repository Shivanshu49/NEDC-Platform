# NEDC Platform

> **National Entrepreneurship Development Center** — a marketing site and paid learning platform where enrolled students join live Zoom sessions and watch share-proof recordings afterward.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-INR-0C2451?logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 About

NEDC runs **5–6 day live online entrepreneurship programs** and sells them as paid courses. This is the full platform behind that:

- A **public marketing site** — home, program details, speakers, team, gallery, FAQ, and pricing.
- **Passwordless authentication** and a **Razorpay checkout** that unlocks access on a verified payment.
- A **protected student dashboard** with the per-day session schedule, live Zoom join links, and recordings.
- A **share-proof recordings pipeline** — Zoom recordings are ingested into Mux and played back behind short-lived signed tokens, so a leaked URL is worthless.

There is **no custom admin UI** by design: staff manage courses, cohorts, sessions, students, and all marketing content directly in the Supabase Table Editor — no deploy needed to change content.

---

## ✨ Features

### Public (marketing)
- 🏠 Home / landing page
- 📚 Program page — curriculum, dates, and mentors
- 🎤 Speakers and 👥 Team directories
- 🖼️ Photo gallery
- ❓ FAQ with an accessible accordion
- 💳 Pricing with an **Enroll** call-to-action
- 🔁 All content is data-driven from Supabase — edit rows, not code

### Enrolled (students only)
- 🔐 Passwordless sign-in (magic-link / email OTP + Google)
- 🛒 Razorpay checkout with a server-verified webhook that records the payment and unlocks access
- 📧 Automatic receipt + Zoom join link email on successful payment
- 📅 Dashboard with each cohort's day-by-day session schedule and live / upcoming / past badges
- 🎥 In-dashboard recording playback via signed, share-proof URLs
- 🚪 Access is row-level-secured — refund a student and their access disappears instantly

---

## 🧰 Tech stack

| Area | Choice | Notes |
|------|--------|-------|
| Framework | **Next.js 16.2.6** (App Router) | React 19, Turbopack |
| Language | **TypeScript** (strict) | |
| Styling | **Tailwind CSS v4** | Configured in CSS — **no `tailwind.config.js`** |
| Database / Auth / Storage | **Supabase** (Postgres) | `@supabase/ssr` + `@supabase/supabase-js`, **no ORM**, secured with Row Level Security |
| Validation | **Zod** | |
| Payments | **Razorpay** (INR) | UPI / cards / netbanking |
| Email | **Resend** | Transactional receipts + Zoom links |
| Live sessions | **Zoom** | Join links stored per session |
| Recordings | **Mux** | Signed playback policy |
| Background jobs | **Inngest** | Recording ingestion |
| Rate limiting | **Upstash Redis** | Optional; safe no-op when unset |
| Hosting | **Vercel** | |

> **Note on Tailwind:** there is no `tailwind.config.js`. Tailwind v4 is configured entirely in CSS — brand tokens and theme values live in [`app/globals.css`](app/globals.css).

---

## ⚙️ How it works

### The data spine

```
courses ──< cohorts ──< sessions ──< recordings
                │
        enrollments (user ↔ cohort)   payments (Razorpay ledger)
```

- **course** = the marketing product (a program)
- **cohort** = one dated run of a course — *the thing a student buys*
- **session** = one live day in a cohort (holds the Zoom join link)
- **recording** = the Mux-hosted replay attached to a session
- **enrollments** = the access record linking a user to a cohort

> The access rule: a user can see a cohort's sessions and recordings **only if** they have an `enrollments` row for that cohort with `status = 'active'`. That row is written by the payment webhook (or staff in the Table Editor) — never by the browser.

### Payment flow

1. The **Enroll** button calls `/api/checkout`, which creates a Razorpay order **at the price stored in the database** (never trusting the client).
2. Razorpay processes the payment and calls `/api/webhooks/razorpay`.
3. The webhook **verifies the HMAC signature over the raw body first**, confirms the amount matches the cohort price, then idempotently records the payment and creates the enrollment.
4. Resend emails the student a receipt and the Zoom join link.

Money is stored as **integer paise** (e.g. `499900` = ₹4,999.00) to avoid floating-point rounding.

### Share-proof recordings

1. Zoom fires a `recording.completed` event to `/api/webhooks/zoom` (HMAC-verified, with Zoom's URL-validation handshake handled).
2. That dispatches an **Inngest** event; the background job ingests the recording into **Mux** as a **signed** asset and saves the playback ID and status.
3. In the dashboard, the browser requests `/api/recordings/[id]/token`, which re-checks active enrollment at request time and mints a **short-lived Mux JWT**.

Because the Mux asset uses a signed playback policy, the playback ID alone is useless — a leaked link can't be watched, and a refunded student can no longer mint a token.

---

## 🗂️ Project structure

```
app/
  layout.tsx                       # Root layout: fonts, metadata
  globals.css                      # Tailwind v4 entry + brand tokens
  (marketing)/                     # Public pages (route group)
    layout.tsx                     #   Navbar + Footer wrapper
    page.tsx                       #   "/"          home
    program/ speakers/ team/       #   marketing pages
    gallery/ faq/ pricing/
  login/page.tsx                   # Passwordless sign-in
  dashboard/                       # Protected, enrolled-only
    layout.tsx
    page.tsx                       #   lists active enrollments
    [cohortId]/page.tsx            #   per-day session schedule + recordings
  auth/
    callback/route.ts              # OAuth / magic-link code exchange
    signout/route.ts
  api/
    checkout/route.ts              # Creates a Razorpay order (DB price)
    webhooks/razorpay/route.ts     # Verifies payment → records enrollment
    webhooks/zoom/route.ts         # recording.completed → Inngest
    inngest/route.ts               # Background job endpoint
    recordings/[id]/token/route.ts # Mints short-lived signed Mux tokens
components/                        # Navbar, Footer, cards, forms, player…
lib/
  supabase/                        # client / server / admin / middleware
  razorpay.ts  mux.ts  zoom.ts     # service integrations
  email.ts  inngest.ts  inngest-functions.ts
  validation.ts  ratelimit.ts  log.ts
  queries.ts  format.ts  types.ts
supabase/
  migrations/0001_init.sql         # Schema + RLS policies
  migrations/0002_recordings.sql   # Recordings additions
  seed.sql                         # Sample marketing content
proxy.ts                           # Session refresh + /dashboard guard (Next 16)
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 20+**
- A **Supabase** project (free tier is fine)
- For payments/email/recordings: **Razorpay**, **Resend**, **Zoom**, **Mux**, and **Inngest** accounts (only needed for those features)

### 1. Clone and install

```bash
git clone https://github.com/Shivanshu49/NEDC-Platform.git
cd NEDC-Platform
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local` (see [Environment variables](#-environment-variables)). At minimum, the Supabase variables are needed to boot.

### 3. Set up the database

In the **Supabase SQL Editor**, run these files in order:

1. `supabase/migrations/0001_init.sql` — tables, enums, and RLS policies
2. `supabase/migrations/0002_recordings.sql` — recordings additions
3. `supabase/seed.sql` — optional sample marketing content

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Environment variables

Copy `.env.example` to `.env.local` and fill in the values. `NEXT_PUBLIC_*` variables are exposed to the browser (safe values only); everything else is server-only.

| Variable | Service | Server-only |
|----------|---------|:-----------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | ✅ |
| `NEXT_PUBLIC_SITE_URL` | App | |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay | |
| `RAZORPAY_KEY_SECRET` | Razorpay | ✅ |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay | ✅ |
| `RESEND_API_KEY` | Resend | ✅ |
| `RESEND_FROM_EMAIL` | Resend | ✅ |
| `ZOOM_ACCOUNT_ID` | Zoom | ✅ |
| `ZOOM_CLIENT_ID` | Zoom | ✅ |
| `ZOOM_CLIENT_SECRET` | Zoom | ✅ |
| `ZOOM_WEBHOOK_SECRET_TOKEN` | Zoom | ✅ |
| `MUX_TOKEN_ID` | Mux | ✅ |
| `MUX_TOKEN_SECRET` | Mux | ✅ |
| `MUX_SIGNING_KEY_ID` | Mux | ✅ |
| `MUX_SIGNING_KEY_PRIVATE` | Mux | ✅ |
| `INNGEST_EVENT_KEY` | Inngest | ✅ |
| `INNGEST_SIGNING_KEY` | Inngest | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | ✅ |

---

## 📜 Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |

---

## ☁️ Deployment

Deploys cleanly to **Vercel**:

1. Import the repo into Vercel.
2. Add every variable from `.env.example` under **Project → Settings → Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to your production domain).
3. Deploy.
4. Point your service webhooks at the deployed URLs:
   - Razorpay → `https://your-domain.com/api/webhooks/razorpay`
   - Zoom → `https://your-domain.com/api/webhooks/zoom`
   - Inngest → `https://your-domain.com/api/inngest`

---

## 🛡️ Security highlights

- **Row Level Security** on every table — the database is the authorization boundary, not the UI.
- **Server-verified payments** — enrollment is granted only by the HMAC-verified Razorpay webhook; prices come from the database, never the client.
- **Passwordless auth** — no passwords are stored or handled by the app.
- **Share-proof recordings** — signed Mux playback tokens are minted per request after re-checking enrollment.
- **Signed webhooks** — both Razorpay and Zoom webhooks verify signatures on the raw request body.
- **Secrets stay server-side** — service-role and integration keys are never shipped to the browser.

---

## 🗺️ Status

All core phases are complete:

- ✅ Project scaffold + Supabase schema
- ✅ Public marketing pages
- ✅ Auth + Razorpay checkout + enrollment + email
- ✅ Protected student dashboard
- ✅ Recordings pipeline (Zoom → Inngest → Mux)
- ✅ Security hardening pass

---

## 📄 License

[MIT](LICENSE) © Shivanshu Dixit

---

## 👤 Author

**Shivanshu Dixit**
GitHub: [@Shivanshu49](https://github.com/Shivanshu49)
