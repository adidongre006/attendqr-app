# AttendQR

QR-based attendance tracking with a rotating (45-60s) QR code and server-side
IP capture to flag likely proxy attendance. Next.js App Router (no `src/`),
Neon Postgres via Drizzle ORM, custom JWT auth for teachers and students.

## How it works

**Rotating QR (`lib/qr-token.ts`, `app/api/sessions/[id]/token/route.ts`)**
A teacher starts a session. Their screen (`LiveQRDisplay`) polls
`/api/sessions/:id/token` roughly every `QR_ROTATE_SECONDS - 3` seconds.
Each call mints a brand-new signed JWT (`{ sessionId, exp }`) — nothing is
cached — encoded into a QR pointing at `/scan?token=...`. `jose.jwtVerify`
rejects the token the instant `exp` passes, which is the entire enforcement
of "the QR stops working after ~45s". A screenshot or a re-shared photo of
the code is worthless once its window closes.

**Proxy / duplicate-device detection (`lib/get-ip.ts`, `app/api/attendance/mark`,
`app/api/export`)**
When a student scans, the server reads their IP from `x-forwarded-for` (or
`cf-connecting-ip` / `x-real-ip`) — never from anything the client sends —
and stores it with the attendance record. Marking attendance is never
blocked on IP alone (legitimate classmates share classroom Wi-Fi), but any
IP address used by 2+ different students on the same date is flagged: shown
live on the session page and highlighted **yellow** in the exported `.xlsx`.

**Auth** Two independent JWT cookies (`teacher_token`, `student_token`,
`lib/auth.ts`), checked both in `middleware.ts` (edge, protects `/admin`,
`/student`, `/scan`) and again in server components/route handlers. No
public sign-up — teacher accounts are created via `scripts/seed-admin.ts`;
students are added from the admin roster page.

**Export (`app/api/export/route.ts`)** Pick a date on `/admin/export`,
generates an `.xlsx` (via `exceljs`, which supports cell fills) listing
present students (roll no, name, subject, time, IP) plus absentees, with
duplicate-IP rows filled yellow.

## Project structure (no `src/`)

```
app/                  routes (App Router)
  admin/              teacher dashboard (protected)
  student/            student dashboard (protected)
  scan/               camera QR scanner (protected)
  login/              unified teacher/student login
  api/                route handlers
lib/                  db, schema, auth, qr-token, ip, session helpers
components/           LiveQRDisplay, QRScanner, ui primitives
scripts/seed-admin.ts creates the first teacher account
middleware.ts         edge route protection
```

## Setup

1. Create a Neon project → copy the pooled connection string.
2. `cp .env.example .env.local` and fill in `DATABASE_URL`, `AUTH_SECRET`,
   `QR_SECRET` (e.g. `openssl rand -base64 48` each), `NEXT_PUBLIC_APP_URL`,
   and the `SEED_TEACHER_*` values.
3. `npm install`
4. `npm run db:generate && npm run db:migrate` — creates the tables in Neon.
5. `npm run seed:admin` — creates your teacher login.
6. `npm run dev` → open `http://localhost:3000`.

Deploying (e.g. Vercel): set the same env vars in the project settings, and
set `NEXT_PUBLIC_APP_URL` to your production URL (used to build the link
encoded in the QR). Camera access for `/scan` requires HTTPS, which Vercel
gives you by default.

## Fonts

Plus Jakarta Sans (light, body/display) and Fira Code (roll numbers,
timestamps, IP addresses, countdowns) are loaded via `next/font/google` in
`app/layout.tsx` and exposed as `font-sans` / `font-data` (see
`tailwind.config.ts` and `app/globals.css`).

## Known trade-offs

- IP matching is a *signal*, not proof — shared Wi-Fi triggers it
  legitimately. It's surfaced for teacher review, never an auto-block.
- Default student password is their roll number; add a "change password"
  flow before using this with a real class.

## Troubleshooting

**"Invalid email or password" on teacher login** — run `npm run seed:admin`
and read its output carefully: it prints the exact email/password it just
seeded. If `.env.local` is missing or `SEED_TEACHER_EMAIL`/
`SEED_TEACHER_PASSWORD` aren't set in it, the script warns you and falls
back to `admin@school.edu` / `change-this-password` — log in with those, or
fix `.env.local` and re-run the script (it updates the existing account
rather than erroring on a duplicate).

**Login "succeeds" but `/admin` immediately errors** — check that nothing
in `lib/auth.ts` (imported by `middleware.ts`, which runs on the Edge
Runtime) has grown a Node-only dependency again. Password hashing
(`bcryptjs`) belongs in `lib/password.ts` only.
# attendqr-app
