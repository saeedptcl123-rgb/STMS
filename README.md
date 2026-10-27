# STMS - Student Management System

A school administration system built with Next.js 16, Prisma, and SQLite.

## Features

- **Students** - admission, profiles, class/section management, photo upload, activate/deactivate
- **Attendance** - daily class-wise attendance marking
- **Fees** - fee structures, payment recording, printable receipts, 3-up challans (bank / school / student copies)
- **Exams** - exam setup, marks entry, and results
- **Dashboard** - student counts, attendance and collection charts, recent activity

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Prisma ORM with SQLite
- Tailwind CSS v4 + shadcn/ui (Base UI)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure the database
cp .env.example .env

# 3. Apply migrations
npx prisma migrate deploy

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database lives at `prisma/dev.db` and is not committed. Run
`npx prisma migrate dev` while developing if you change the schema.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Browse the database |
