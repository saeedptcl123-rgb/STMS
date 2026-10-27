# STMS - Student Management System

A school administration system built with Next.js 16, Prisma, and PostgreSQL.

## Features

- **Students** - admission, profiles, class/section management, photo upload, activate/deactivate
- **Attendance** - daily class-wise attendance marking
- **Fees** - fee structures, payment recording, printable receipts, 3-up challans (bank / school / student copies)
- **Exams** - exam setup, marks entry, and results
- **Dashboard** - student counts, attendance and collection charts, recent activity

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Prisma ORM with PostgreSQL
- Tailwind CSS v4 + shadcn/ui (Base UI)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure the database
cp .env.example .env
# then edit .env and set DATABASE_URL to your PostgreSQL connection string

# 3. Apply migrations
npx prisma migrate deploy

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Any PostgreSQL database works (Neon, Supabase, Vercel Postgres, or a local
server). Run `npx prisma migrate dev` while developing if you change the
schema.

## Deploy on Vercel

1. Create a PostgreSQL database (Neon or Prisma Postgres from the Vercel
   Marketplace, or any external Postgres) and connect it to the project.
2. Make sure `DATABASE_URL` exists in the Vercel project for Production,
   Preview, and Development. The app also falls back to the variables these
   integrations create:
   - Neon: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`
   - Vercel Postgres: `POSTGRES_PRISMA_URL`, `POSTGRES_URL`
   - Prisma Postgres: `DATABASE_URL`, `PRISMA_DATABASE_URL`
3. Deploy. The `vercel-build` script generates Prisma Client, applies
   migrations with `prisma migrate deploy`, and builds the app.

Migrations use the direct (non-pooled) connection whenever one is available
(`DIRECT_URL`, `DATABASE_URL_UNPOOLED`, or `POSTGRES_URL_NON_POOLING`), because
pooled connections can break Prisma Migrate.

### Migration troubleshooting

- `P3005` (schema is not empty) or `P3018` (relation already exists): the
  database has tables that Prisma did not create. For a new database, recreate
  it or reset it with `npx prisma migrate reset --force` (destructive), then
  redeploy.
- `P1001` or `P1017`: the build cannot reach the database. Set `DIRECT_URL` to
  the direct/unpooled connection string.
- `P1010` or "User denied access": `DATABASE_URL` is an Accelerate
  `prisma+postgres://` URL. Use the direct `postgres://` string instead.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run migrate:deploy` | Apply migrations using the direct connection |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Browse the database |
