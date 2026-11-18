# FIXORA - Home Service Solution

Full-stack home service marketplace: customers book vetted providers for AC repair,
plumbing, electrical, cleaning, appliance repair, and laundry.

**Tagline:** Your Home, Our Solution.

## Stack

- Next.js (App Router) + React + TypeScript + Tailwind CSS
- Drizzle ORM + Turso (libSQL)
- Session auth: bcrypt + HTTP-only cookies
- Lucide icons

## Local setup

```bash
npm install
cp .env.example .env        # defaults to a local file: SQLite db
npm run db:migrate          # create tables
npm run db:seed             # demo data
npm run dev                 # http://localhost:3000
```

## Demo accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@fixora.test | admin1234 |
| Customer | alice@fixora.test | customer1234 |
| Customer | robert@fixora.test | customer1234 |
| Provider | marcus@fixora.test | provider1234 |
| Provider (any of 5) | sofia/james/lena/devon/tom @fixora.test | provider1234 |

## Turso setup

```bash
# install the Turso CLI, then:
turso db create fixora
turso db show fixora --url          # -> TURSO_DATABASE_URL (libsql://...)
turso db tokens create fixora       # -> TURSO_AUTH_TOKEN
```

Put both values in `.env` (and later in Vercel env vars), then run migrations:

```bash
npm run db:migrate
npm run db:seed   # optional demo data
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel: **New Project** -> import the repo (framework auto-detected).
3. Add environment variables:
   - `TURSO_DATABASE_URL` = your libsql:// URL
   - `TURSO_AUTH_TOKEN` = your Turso token
   - `SESSION_SECRET` = a random string (`openssl rand -base64 32`)
4. Deploy. After the first deploy, run `npm run db:migrate` locally with the
   production `.env` values to create the tables (migrations run against Turso
   from anywhere), then optionally seed.
5. Health check: `GET /api/health` returns `{"status":"ok"}` when the DB is reachable.

## Project structure

```
app/                 # routes (public pages + customer/provider/admin dashboards)
components/          # UI + feature components
db/                  # Drizzle schema + client
drizzle/             # generated SQL migrations
lib/                 # auth, validations, server actions, helpers
scripts/             # migrate + seed scripts
```

## Feature map

- **Auth**: email/password, bcrypt hashing, DB-backed sessions in HTTP-only cookies, RBAC (customer / provider / admin)
- **Customer**: browse/search/filter services, book with date + time slot, double-booking prevention (partial unique index), booking status tracking, cancel, review completed bookings, message providers, notifications, profile
- **Provider**: application + admin approval, service CRUD, availability schedule, accept/reject/progress bookings, chat, ratings, profile
- **Admin**: approve/reject providers, manage categories, activate/deactivate listings, view bookings, resolve complaints, delete users
- **Security**: server-side role checks on every dashboard, ownership checks on bookings/messages, zod validation, login rate limiting, no secrets client-side

## Notes

- Prices are stored in cents to avoid float issues.
- Slot model: fixed 2-hour slots (08:00-10:00 ... 15:00-17:00); a provider can hold
  at most one active booking per slot (enforced in the DB).
- Profile photos use URL fields; wire a cloud storage provider (UploadThing,
  S3, Cloudinary) if file uploads are needed.
- Rate limiting is in-memory (per instance). Use Upstash Redis for multi-instance
  deployments.
