# Quickstart: Student Management System

**Feature**: 001-student-mgmt-system  
**Date**: 2026-09-08

## Prerequisites

- Node.js 20.x or later
- npm or yarn package manager

## Setup Instructions

### 1. Initialize Project

```bash
# Create Next.js project
npx create-next-app@latest studentmng --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project
cd studentmng
```

### 2. Install Dependencies

```bash
# Database
npm install prisma @prisma/client

# UI Components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label select card table badge dialog alert separator

# Form Handling
npm install react-hook-form @hookform/resolvers zod

# Utilities
npm install date-fns lucide-react clsx tailwind-merge
```

### 3. Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

### 4. Configure Environment

Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
```

### 5. Database Schema

Replace `prisma/schema.prisma` with the data model from `data-model.md`.

### 6. Generate Prisma Client

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 7. Project Structure

Create the directory structure from `plan.md`:

```bash
# Create directories
mkdir -p src/components/{ui,layout,students,attendance,dashboard,fees}
mkdir -p src/lib
mkdir -p src/actions
mkdir -p src/app/{students/admission,attendance,fees/receipts,exams/results}
mkdir -p public/uploads
```

### 8. Start Development

```bash
npm run dev
```

Open http://localhost:3000

## Implementation Order

### Phase 1: Foundation (Start Here)

1. **Prisma Setup** (`prisma/schema.prisma`)
   - Define all 6 entities
   - Run migrations

2. **Prisma Client** (`src/lib/db.ts`)
   - Singleton pattern

3. **Layout Components**
   - `src/app/layout.tsx` - Root layout
   - `src/components/layout/Sidebar.tsx`
   - `src/components/layout/Header.tsx`
   - `src/components/layout/Shell.tsx`

4. **Utilities** (`src/lib/utils.ts`)
   - cn() function for classnames
   - formatDate() helper
   - generateStudentId() function

### Phase 2: Student Module

1. **Validations** (`src/lib/validations.ts`)
   - Student schema
   - Attendance schema
   - Fee schema
   - Exam schema

2. **Student Actions** (`src/actions/student.ts`)
   - createStudent
   - updateStudent
   - deleteStudent
   - getStudents
   - getStudentById

3. **Student Components**
   - `src/components/students/AdmissionForm.tsx`
   - `src/components/students/StudentTable.tsx`

4. **Student Pages**
   - `src/app/students/page.tsx` - List
   - `src/app/students/admission/page.tsx` - Form
   - `src/app/students/[id]/page.tsx` - Detail

### Phase 3: Attendance Module

1. **Attendance Actions** (`src/actions/attendance.ts`)
   - markAttendance
   - getAttendance
   - getStudentAttendance

2. **Attendance Components**
   - `src/components/attendance/AttendanceGrid.tsx`

3. **Attendance Page**
   - `src/app/attendance/page.tsx`

### Phase 4: Dashboard

1. **Dashboard Components**
   - `src/components/dashboard/StatsCard.tsx`
   - `src/components/dashboard/RecentActivity.tsx`

2. **Dashboard Page**
   - `src/app/page.tsx`

### Phase 5: Fee Module

1. **Fee Actions** (`src/actions/fees.ts`)
   - createFeeStructure
   - recordPayment
   - getDues
   - getPayments

2. **Fee Components**
   - `src/components/fees/PaymentForm.tsx`

3. **Fee Pages**
   - `src/app/fees/page.tsx`
   - `src/app/fees/receipts/page.tsx`

### Phase 6: Exam Module

1. **Exam Actions** (`src/actions/exams.ts`)
   - createExam
   - enterMarks
   - getResult
   - getClassResults

2. **Exam Pages**
   - `src/app/exams/page.tsx`
   - `src/app/exams/results/page.tsx`

### Phase 7: Polish

1. Loading states for all pages
2. Error boundaries
3. Responsive testing
4. Form validation UX
5. Empty states

## Key Files Reference

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/db.ts` | Prisma client |
| `src/lib/validations.ts` | Zod schemas |
| `src/lib/utils.ts` | Helper functions |
| `src/actions/*.ts` | Server actions |
| `src/components/ui/*` | shadcn components |
| `src/components/layout/*` | Layout components |

## Testing Checklist

- [ ] Student admission form validates all fields
- [ ] Duplicate roll number rejected
- [ ] Attendance marks save correctly
- [ ] Dashboard shows accurate stats
- [ ] Fee payments record properly
- [ ] Report cards generate correctly
- [ ] Responsive on mobile
- [ ] All forms show loading states
