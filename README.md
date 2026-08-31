# DarasaLive

Revision materials platform for CBC and 8-4-4 learners in Kenya — notes, exams,
marking schemes, lesson plans, and schemes of work, unlocked via M-Pesa
subscription.

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend + backend, deployed on Vercel
- **Prisma + Neon (Postgres)** — database
- **Vercel Blob** — file storage for uploaded materials
- **Safaricom Daraja API** — M-Pesa STK Push payments
- **Tailwind CSS** — styling

## Getting started

```bash
npm install
cp .env.example .env   # fill in Neon, Blob, JWT, and Daraja credentials
npx prisma migrate dev --name init
npx prisma db seed     # populates curricula, levels, content types, plans
npm run dev
```

## Project structure

```
prisma/
  schema.prisma       Database schema — curricula, levels, subjects,
                       content types, materials, users, plans, subscriptions
  seed.ts              Seeds CBC + 8-4-4 levels, content types, and pricing plans

src/
  app/
    page.tsx           Landing page
    subjects/          Subject browser (reads curricula from the DB)
    login/              
    register/          Registration + plan selection
    admin/              Admin dashboard shell
    api/
      mpesa/stkpush/   Initiates STK Push
      mpesa/callback/  Receives Safaricom's payment result
      materials/       CRUD for uploaded materials
  lib/
    db.ts              Prisma client singleton
    auth.ts             Password hashing + session JWTs
    mpesa.ts            Daraja API helper (access token, STK push)
  components/           Shared UI components (empty — add as you build)
```

## What's implemented vs. stubbed

This scaffold gives Phase 2 a running start, not a finished product:

- ✅ Full database schema, ready to migrate
- ✅ Seed data for both curricula's grade levels and the five content types
- ✅ Landing page, subject browser (live from DB), login/register UI, admin shell
- ✅ M-Pesa STK Push request wired to Daraja's sandbox endpoint
- ⬜ **Auth is not wired up** — forms don't submit yet; `lib/auth.ts` has the
  pieces (hashing, JWT) but no `/api/auth/*` routes or middleware yet
- ⬜ **M-Pesa callback handling is a stub** — see the TODO in
  `src/app/api/mpesa/callback/route.ts` for the exact logic needed to flip a
  subscription to ACTIVE
- ⬜ **No file upload UI yet** — the `/api/materials` POST route expects a
  `fileUrl` already uploaded to Vercel Blob; build the client-side Blob
  upload widget on the admin page next
- ⬜ **Subjects aren't seeded** — only curricula and levels are; add subjects
  per level (or build an admin UI for the client to do it themselves)
- ⬜ **No access control** — every page and API route is currently open;
  add `middleware.ts` to gate `/admin` and subscription-locked content

## Design notes

The visual identity leans into the "darasa" (classroom) concept directly: a
chalkboard-green hero with a chalk-white "register" card, content types laid
out like exercise-book tabs, and pricing shown as a ledger rather than
generic SaaS cards. Tailwind tokens for this palette are in
`tailwind.config.ts` under `colors.board`, `colors.chalk`, and `colors.gold`.
