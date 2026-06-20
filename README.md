# Atlas — professional networking, jobs, and learning

A full-stack LinkedIn-style platform: profiles & connections, a feed, direct messaging,
job postings with an applicant pipeline, and a course platform with progress tracking
and PDF certificates — all in one Next.js app.

This build is tuned to run **entirely on your machine with zero external accounts**:
SQLite instead of a hosted Postgres, local disk storage instead of S3, and polling
instead of a websocket server. Swap any of those for the "real" version later — see
[Going to production](#going-to-production) at the bottom.

## Quick start

Requirements: **Node.js 18.18+** (Node 20 recommended) and npm. That's it.

```bash
# 1. Install dependencies
npm install

# 2. Create the SQLite database and load demo data
npm run setup
# (this runs: prisma generate && prisma db push && prisma db seed)

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000** and sign in with a seeded demo account:

| Email | Password | Role |
|---|---|---|
| `alex@atlas.dev` | `password123` | Job seeker / professional |
| `jordan@atlas.dev` | `password123` | Recruiter (Northwind Labs) |
| `sam@atlas.dev` | `password123` | Training provider |
| `priya@atlas.dev`, `maria@atlas.dev`, `liam@atlas.dev`, `nina@atlas.dev`, `omar@atlas.dev`, `ava@atlas.dev`, `noah@atlas.dev` | `password123` | Mixed |

Or just register a brand-new account from `/register` — there's no email verification
step in this build, so you're in immediately.

If you ever want to wipe and reload the demo data:

```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

## What's implemented

**Accounts & profiles** — email/password auth (NextAuth, optional Google/LinkedIn OAuth
if you add API keys to `.env`), photo + resume upload, experience & education timeline,
skills with peer endorsements, profile visibility (public / connections-only / private),
and a profile-completeness meter.

**Connections** — search/discover people by name, company, skill, or location; send/
accept/reject/withdraw connection requests; one-way Follow vs mutual Connect; "people
you may know" ranked by mutual connections; block/remove.

**Feed** — text/image/link/document posts, likes, comments, share; feed mixes your
connections' + followed people's posts, newest first, topped up with global posts if
your network is small.

**Messaging** — 1:1 chat between connections, typing indicator, read receipts, all via
2.5s polling (no extra server process to run).

**Jobs** — post a job under a company you create on the fly; browse/filter by location,
work type, experience level, remote, skills; one-click apply using your profile resume;
saved jobs; an applicant pipeline board (Applied → Shortlisted → Interview → Offer →
Rejected) for recruiters; an application status tracker for applicants; skill-based job
recommendations.

**Learning** — build a course with modules, lessons (text / video link / document link /
quiz), publish it; enroll, track per-lesson progress; quizzes must be passed (≥70%) to
complete a lesson; finishing a course auto-adds its skills to your profile and unlocks a
downloadable PDF certificate (generated with `pdf-lib`, no external service); ratings
& reviews; recommended courses based on the skill gap between your profile and the jobs
you've saved/applied to.

**Search & notifications** — one global search across people/jobs/courses/companies;
an in-app notification center (connections, engagement, job matches, application
updates, course updates, messages) with per-category in-app/email toggles in Settings
(email sending itself isn't wired up — see below).

**Settings** — notification preferences, password change, deactivate account, permanently
delete account (cascades through all your data).

## Intentional simplifications (this is a local/dev build)

- **No email service.** Email verification is skipped (accounts are usable immediately),
  and "forgot password" shows the reset link directly on screen / in the server console
  instead of emailing it. Notification "email" toggles in Settings are stored but not
  acted on. Wire up Resend/SES/Postmark in `src/app/api/auth/forgot-password/route.ts`
  when you're ready.
- **Local disk storage**, not S3. Uploads land in `public/uploads/...`. See
  `src/lib/uploads.ts` — it's a single function, easy to swap for an S3 SDK call.
- **Polling, not websockets.** Messages and notifications refresh every few seconds.
  Good enough for local use; swap in Socket.io or Pusher for true push if you deploy
  this for real.
- **Company logo upload UI** isn't built (companies render with a fallback icon).
  The data model supports it — only the form is missing.
- **OAuth (Google/LinkedIn) is wired but inactive** until you add real client
  ID/secret pairs to `.env`. Credentials (email/password) work out of the box.

## Project structure

```
prisma/schema.prisma      Data model (SQLite — see note below on enums)
prisma/seed.ts            Demo data: 10 users, 2 companies, 4 jobs, 4 courses, posts, etc.
src/app/
  page.tsx                 Public landing page
  login/ register/ forgot-password/ reset-password/
  (main)/                  Authenticated app shell (Navbar + auth guard)
    feed/ connections/ messages/ jobs/ courses/ companies/ profile/ notifications/ settings/ search/
  api/                      Route handlers — one folder per resource
src/components/             Shared UI (Avatar, Navbar, PostCard, JobCard, CourseCard, …)
src/lib/                    prisma client, auth config, validation (zod), constants, utils
```

A note on the schema: **SQLite has no native enum type**, so fields that would normally
be Prisma enums (role, job status, application status, etc.) are plain `String` columns
with allowed values documented in `src/lib/constants.ts` and validated with `zod` in
`src/lib/validations.ts`. If you migrate to Postgres, you can convert these to real
`enum` blocks in `schema.prisma` if you'd like the extra DB-level constraint.

## Useful scripts

```bash
npm run dev          # start the dev server
npm run build         # production build
npm run start          # run the production build
npm run db:studio      # Prisma Studio — browse/edit the DB in a GUI
npm run db:push        # push schema changes to the DB (no migration history)
npm run db:seed        # re-run the seed script
```

## Going to production

This app was deliberately built so each "local dev" shortcut is isolated and swappable:

1. **Database** — change `datasource db { provider = "postgresql" }` in
   `prisma/schema.prisma`, point `DATABASE_URL` at a real Postgres instance (Railway,
   Supabase, RDS, …), and run `npx prisma migrate dev` instead of `db push`. If you
   want real enum types at the DB level, this is also the time to convert the `String`
   "enum" fields described above.
2. **File storage** — replace the body of `saveUploadedFile()` in `src/lib/uploads.ts`
   with an S3 (or R2/Spaces) `PutObjectCommand` call; everything that calls it is
   unaware of the underlying storage.
3. **Real-time** — replace the polling `setInterval` calls in `messages/page.tsx` and
   `Navbar.tsx` with a Socket.io or Pusher client; the API already returns the same
   shape of data either way.
4. **Email** — add a mailer call in `forgot-password/route.ts` and wherever
   `src/lib/notify.ts` creates a notification, gated by the user's `*Email` preference
   flags (already stored in `NotificationPreference`).
5. **Search at scale** — `src/app/api/search/route.ts` and the jobs/courses/people
   filters currently use Prisma's `contains` (SQL `LIKE`). Swap in Meilisearch or
   Algolia behind the same route signatures if your catalog gets large.
6. **Deploy** — Vercel for the Next.js app; just set the production `DATABASE_URL`,
   `NEXTAUTH_URL`, and a strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`) as
   environment variables. Note that Vercel's filesystem is read-only/ephemeral, so step
   2 (real file storage) is required before deploying there.
