# NEDC Platform

Website for the **National Entrepreneurship Development Center** — a public
marketing site plus a paid area where enrolled students join live Zoom sessions
and watch the recordings afterward.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind v4**, backed by
**Supabase** (database, auth, storage), **Razorpay** (payments, INR), **Resend**
(email), and **Zoom** (live sessions). Deployed on **Vercel**.

## Quick start

```bash
nvm use                       # if you use nvm (Node 20+)
cp .env.example .env.local    # then fill in the values (see .env.example)
npm install
npm run dev                   # http://localhost:3000
```

To populate the marketing pages with content, set up a Supabase project and run
`supabase/migrations/0001_init.sql`, then `supabase/migrations/0002_recordings.sql`,
then `supabase/seed.sql` in the Supabase SQL Editor.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. Every variable the
app reads is listed there, grouped by the build phase that first needs it. Never
commit `.env.local`; only the placeholder `.env.example` is tracked.

## Project structure

```
app/            # Next.js App Router — pages, layouts, and route handlers
  (marketing)/  # public pages: home, program, speakers, team, gallery, faq, pricing
  dashboard/    # protected, enrolled-only student area
  api/          # route handlers: checkout, webhooks (razorpay/zoom), inngest, recordings
components/      # reusable UI
lib/            # supabase clients, razorpay, email, mux, zoom, inngest, helpers
supabase/       # SQL migrations + seed data
proxy.ts        # session refresh + /dashboard route guard (Next 16 proxy)
```

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Status

- ✅ Phase 1 — project scaffold, Supabase setup, database schema
- ✅ Phase 2 — public marketing pages
- ✅ Phase 3 — auth + Razorpay checkout + enrollment + email
- ✅ Phase 4 — protected student dashboard
- ✅ Phase 5 — recordings pipeline (Zoom → Inngest → Mux)
- ✅ Phase 6 — security hardening pass

## License

[MIT](LICENSE)
