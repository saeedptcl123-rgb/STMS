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

1. Create a PostgreSQL database (for example the Neon integration in the
   Vercel Marketplace) and copy its **pooled** connection string.
2. Add it to the project as the `DATABASE_URL` environment variable.
3. Deploy. The `vercel-build` script generates the Prisma client, applies
   migrations with `prisma migrate deploy`, and builds the app.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Browse the database |
