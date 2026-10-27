# Research: Student Management System

**Feature**: 001-student-mgmt-system  
**Date**: 2026-09-08  
**Status**: Complete

## Research Tasks

### 1. Next.js App Router Best Practices

**Decision**: Use Next.js 14+ with App Router pattern

**Rationale**:
- App Router is the recommended approach for new Next.js projects
- Server Components reduce client-side JavaScript
- Built-in loading states and error boundaries
- Better SEO and performance

**Findings**:
- Use `'use client'` directive only for interactive components
- Keep server components as parent containers
- Use `loading.tsx` for automatic loading states
- Use `error.tsx` for error boundaries

**Alternatives Considered**:
- Pages Router: Rejected - App Router is the future

### 2. Prisma with SQLite Setup

**Decision**: Use Prisma ORM with SQLite provider

**Rationale**:
- Zero-config database setup
- Type-safe queries
- Automatic migrations
- Good documentation

**Findings**:
- SQLite file stored at `prisma/dev.db`
- Use `prisma migrate dev` for schema changes
- Use `prisma generate` after schema changes
- Prisma Client singleton pattern prevents multiple instances

**Setup Commands**:
```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

### 3. Tailwind CSS Configuration

**Decision**: Use Tailwind CSS with custom color theme

**Rationale**:
- User requested colorful, professional design
- Tailwind allows custom color palettes
- Works perfectly with shadcn/ui

**Color Palette**:
```typescript
// tailwind.config.ts
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  accent: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}
```

### 4. shadcn/ui Components

**Decision**: Use shadcn/ui for UI components

**Rationale**:
- Pre-built accessible components
- Customizable with Tailwind
- No runtime overhead (copy-paste components)
- Great documentation

**Components Needed**:
- Button, Input, Label, Select
- Card, Dialog, Alert
- Table, Badge
- Form, Separator

**Setup**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card table
```

### 5. Zod Validation

**Decision**: Use Zod for form validation

**Rationale**:
- TypeScript-first validation
- Works with React Hook Form
- Shared schemas client/server
- Descriptive error messages

**Schema Example**:
```typescript
import { z } from 'zod';

const studentSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2),
  rollNumber: z.string().min(1),
  class: z.string().min(1),
  section: z.string().min(1),
  dateOfBirth: z.date(),
  gender: z.enum(['male', 'female', 'other']),
  contact: z.string().min(10),
  email: z.string().email().optional(),
  address: z.string().min(5),
  parentName: z.string().min(2),
  parentContact: z.string().min(10),
});
```

### 6. Server Actions Pattern

**Decision**: Use Next.js Server Actions for data mutations

**Rationale**:
- Simplifies form handling
- No API route boilerplate
- Automatic CSRF protection
- Type-safe

**Pattern**:
```typescript
// src/actions/student.ts
'use server'

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createStudent(formData: FormData) {
  const data = {
    firstName: formData.get('firstName') as string,
    // ... other fields
  };
  
  // Validate with Zod
  const validated = studentSchema.parse(data);
  
  // Create in database
  const student = await prisma.student.create({ data: validated });
  
  // Revalidate cache
  revalidatePath('/students');
  
  return { success: true, student };
}
```

### 7. Prisma Client Singleton

**Decision**: Use singleton pattern for Prisma Client

**Rationale**:
- Prevents multiple instances in development
- Hot reload creates new instances
- Memory leak prevention

**Pattern**:
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 8. Responsive Design Strategy

**Decision**: Mobile-first responsive design

**Rationale**:
- User requirement for mobile access
- Tailwind's responsive prefixes make this easy
- Better mobile performance

**Breakpoints**:
- Mobile: < 640px (default)
- Tablet: 640px - 1024px (sm, md)
- Desktop: > 1024px (lg, xl)

**Layout Strategy**:
- Sidebar collapses to hamburger on mobile
- Tables become cards on mobile
- Forms stack vertically on mobile

## Research Summary

All technical decisions resolved. No NEEDS CLARIFICATION items remain.

| Topic | Decision | Status |
|-------|----------|--------|
| Framework | Next.js 14+ App Router | ✅ Resolved |
| Database | SQLite via Prisma | ✅ Resolved |
| Styling | Tailwind CSS + shadcn/ui | ✅ Resolved |
| Validation | Zod + React Hook Form | ✅ Resolved |
| State | Server Actions | ✅ Resolved |
| Auth | None (initial version) | ✅ Resolved |
| Testing | Jest + RTL | ✅ Resolved |
