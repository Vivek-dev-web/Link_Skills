# SkillWarehouse — match skills to the right roles

A full-stack professional networking and job platform: profiles & connections, a live
feed, direct messaging, skill assessments, job postings with an applicant pipeline,
salary insights, a recruiter/trainer portal, and a course platform with progress
tracking and PDF certificates — all in one Next.js app.

Deployed on **Vercel** with a **PostgreSQL** database (Neon). The `jobwarehouse` schema
keeps all tables isolated in a named namespace.

## Quick start

Requirements: **Node.js 18.18+** (Node 20 recommended), npm, and a **PostgreSQL**
connection string (Neon free tier works perfectly).

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file (copy from .env.example or create manually)
DATABASE_URL="postgresql://user:pass@host/db?schema=jobwarehouse"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# 3. Apply the database schema and load demo data
npx prisma migrate deploy
npx prisma db seed

# 4. Start the dev server
npm run dev
```

Open **http://localhost:3000** and sign in with a seeded demo account:

| Email | Password | Role |
|---|---|---|
| `alex@atlas.dev` | `password123` | Job seeker / professional |
| `jordan@atlas.dev` | `password123` | Recruiter (Northwind Labs) |
| `sam@atlas.dev` | `password123` | Training provider |
| `priya@atlas.dev`, `maria@atlas.dev`, `liam@atlas.dev`, `nina@atlas.dev`, `omar@atlas.dev`, `ava@atlas.dev`, `noah@atlas.dev` | `password123` | Mixed |

Or register a new account at `/register` — there's no email verification step, so
you're in immediately.

To reset demo data:

```bash
npx prisma migrate reset   # drops, re-applies migrations, re-seeds
```

## What's implemented

**Accounts & profiles** — email/password auth (NextAuth), optional Google/LinkedIn
OAuth (add keys to `.env`), photo + resume upload, experience & education timeline,
skills with peer endorsements, profile visibility (public / connections-only / private),
and a profile-completeness meter.

**Connections** — search/discover people by name, company, skill, or location; send/
accept/reject/withdraw requests; one-way Follow vs mutual Connect; "people you may know"
ranked by mutual connections; click the "N mutual connections" label to open a popover
listing who you share; block/remove.

**Feed** — text/image/link/document posts, likes, comments, share; feed mixes your
connections' + followed people's posts, newest first, topped up with global posts if
your network is small. Right sidebar shows **live trending hashtags** extracted from
real posts in the last 30 days.

**Messaging** — 1:1 chat between connections, typing indicator, read receipts, all via
2.5 s polling (no extra server process).

**Jobs** — post under a company you create; browse/filter by location, work type,
experience level, remote flag, and skills; one-click apply from your profile; saved
jobs; skill-based recommendations at `/recommended`; application tracker at `/my-jobs`;
job alerts at `/alerts`.

**Recruiter / trainer portal** (`/hire`) — four tabs:
- **Find candidates** — search real DB users by skill or keyword
- **Post a job** — create a job listing linked to your company
- **Pipeline** — live applicant pipeline board per job (Applied → Shortlisted →
  Interview → Offer → Rejected), counts pulled from real DB data
- **Assessments** — create and publish skill assessments; inline MCQ question builder
  (up to 4 options, mark the correct answer per question); stored in localStorage

**Skill assessments** (`/assessments`) — take platform assessments or recruiter-created
custom ones; correct score calculated from real MCQ answers; badge awarded on pass.

**Salary insights** (`/salaries`) — browse aggregated salary ranges by role and company;
submit your own via the "Add your salary" modal (role, company, location, experience,
CTC in LPA).

**Learning** — build a course with modules and lessons (text / video link / document /
quiz); enroll, track per-lesson progress; quizzes must be passed (≥ 70%) to advance;
finishing a course auto-adds skills to your profile and unlocks a downloadable PDF
certificate (generated with `pdf-lib`, no external service); ratings & reviews;
recommended courses based on skill gap against your saved/applied jobs.

**Company pages** — profile with open roles, reviews, interview Q&A, salary data;
follow a company to track updates.

**Search & notifications** — global search across people, jobs, courses, and companies;
in-app notification center (connections, engagement, job matches, application updates,
course updates, messages) with per-category in-app/email toggles in Settings.

**Admin panel** (`/admin`) — user management, post moderation (report queue), job
oversight; admin seed account available via `prisma db seed`.

**Branding** — SkillWarehouse logo (5 ascending buildings + orange growth arrow) used
in the navbar, landing page, auth screens, and as an SVG favicon in the browser tab.
The SVG adapts to light/dark theme via `currentColor`; the favicon uses fixed colours
so it renders correctly even outside CSS context.

## Project structure

```
prisma/
  schema.prisma          Data model (PostgreSQL, schema: jobwarehouse)
  migrations/            Migration history (apply with: prisma migrate deploy)
  seed.ts                Demo data — 10 users, 2 companies, 4 jobs, 4 courses, posts
src/app/
  page.tsx               Public landing page
  login/ register/ forgot-password/ reset-password/
  (main)/                Authenticated app shell (Navbar + auth guard)
    feed/                Live post feed + right sidebar with trending hashtags
    connections/         Discover people, requests, your network + mutual connections popover
    messages/            1:1 chat
    jobs/                Browse, filter, apply, view job detail
    jobs/manage/[id]/    Applicant pipeline for a specific job (recruiter)
    recommended/         Skill-matched job recommendations
    my-jobs/             Applications you've submitted
    alerts/              Job alert preferences
    assessments/         Take platform or custom MCQ assessments
    hire/                Recruiter/trainer portal (4 tabs)
    salaries/            Salary insights + submit your salary
    resume/              Resume builder / upload
    courses/             Browse, enroll, track progress, earn certificates
    companies/[id]/      Company profile — roles, reviews, interviews, salaries
    profile/             Your profile & edit
    notifications/       Notification center
    settings/            Preferences, password, account deletion
    search/              Global search
  api/                   Route handlers — one folder per resource
  admin/                 Admin panel (role-gated)
  embed/posts/[id]/      Embeddable post card (used for share previews)
src/components/          Shared UI — Avatar, Navbar, Logo, PostCard, JobCard, …
src/lib/                 prisma client, auth config, zod validations, constants, utils
public/
  favicon.svg            SVG favicon (SkillWarehouse mark)
  uploads/               User-uploaded files (profile photos, resumes, course assets)
```

## Useful scripts

```bash
npm run dev              # start the dev server (http://localhost:3000)
npm run build            # production build
npm run start            # run the production build
npm run db:studio        # Prisma Studio — browse/edit the DB in a GUI
npm run db:push          # push schema changes without migration history (dev only)
npm run db:seed          # re-run the seed script
```

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string — include `?schema=jobwarehouse` |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Full origin URL (`http://localhost:3000` in dev) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Enables Google OAuth |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | No | Enables LinkedIn OAuth |

## Intentional simplifications

- **No email service.** "Forgot password" logs the reset link to the server console
  instead of emailing it. Wire up Resend/SES/Postmark in
  `src/app/api/auth/forgot-password/route.ts` when ready.
- **Local disk storage, not S3.** Uploads land in `public/uploads/`. See
  `src/lib/uploads.ts` — a single function, easy to swap for an S3 `PutObjectCommand`.
  Note: Vercel's filesystem is ephemeral — step 2 below is required before deploying.
- **Polling, not websockets.** Messages and notifications refresh every few seconds.
  Good enough for local use; swap in Socket.io or Pusher for true push if needed.
- **Assessment answers stored in localStorage.** Custom assessments created in `/hire`
  are persisted client-side under the key `atlas_custom_assessments`. Move to the DB
  for multi-user or multi-device use.
- **Salary submissions are UI-only.** The "Add your salary" modal shows a success state
  but doesn't yet persist to the DB.
- **OAuth is wired but inactive** until you add real client ID/secret pairs to `.env`.
  Email/password works out of the box.

## Going to production (Vercel)

1. **Database** — already PostgreSQL. Point `DATABASE_URL` at your production Neon/
   Supabase/RDS instance and run `npx prisma migrate deploy` on first deploy.
2. **File storage** — replace `saveUploadedFile()` in `src/lib/uploads.ts` with an S3
   (or R2/Spaces) `PutObjectCommand`; all callers are storage-agnostic.
3. **Real-time** — replace `setInterval` polling in `messages/page.tsx` and `Navbar.tsx`
   with a Socket.io or Pusher client; the API returns the same shape either way.
4. **Email** — add a mailer call in `forgot-password/route.ts` and wherever
   `src/lib/notify.ts` creates a notification, gated by the user's `*Email` preference
   flags (already stored in `NotificationPreference`).
5. **Assessments** — migrate custom assessments from localStorage to a new
   `Assessment` / `Question` Prisma model for persistent, multi-user storage.
6. **Search at scale** — `src/app/api/search/route.ts` and the jobs/courses/people
   filters use Prisma `contains` (SQL `ILIKE`). Swap in Meilisearch or Algolia behind
   the same route signatures if the catalogue grows large.
7. **Vercel env vars** — set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in
   the Vercel project dashboard. Add OAuth keys if you enable social login.
