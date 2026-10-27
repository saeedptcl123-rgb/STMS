# Implementation Plan: Student Management System

**Branch**: `001-student-mgmt-system` | **Date**: 2026-09-08 | **Spec**: [spec.md](../spec.md)
**Input**: Feature specification from `/specs/001-student-mgmt-system/spec.md`

## Summary

Build a professional, colorful Student Management System using Next.js with local SQLite storage. The system provides five core modules: student admission, attendance tracking, dashboard analytics, fee management, and exam results. All data persists locally without external database dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x  
**Primary Dependencies**: Next.js 14+ (App Router), Prisma ORM, Tailwind CSS, shadcn/ui  
**Storage**: SQLite via Prisma (local file-based)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web (desktop + mobile responsive)  
**Project Type**: Web application (frontend + backend in single project)  
**Performance Goals**: Dashboard loads <2s, Form submissions <1s, 500 students supported  
**Constraints**: Local storage only, single administrator, no external services  
**Scale/Scope**: 500 students, 5 modules, ~20 pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Library-First | ⚪ N/A | Constitution not configured |
| CLI Interface | ⚪ N/A | Constitution not configured |
| Test-First | ⚪ N/A | Constitution not configured |
| Integration Testing | ⚪ N/A | Constitution not configured |
| Observability | ⚪ N/A | Constitution not configured |

**Gate Result**: ✅ PASSED (no constitution violations - constitution not configured)

## Project Structure

### Documentation (this feature)

```text
specs/001-student-mgmt-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
studentmng/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (optional)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with sidebar
│   │   ├── page.tsx           # Dashboard (home)
│   │   ├── students/
│   │   │   ├── page.tsx       # Student list
│   │   │   ├── admission/
│   │   │   │   └── page.tsx   # Admission form
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Student detail
│   │   ├── attendance/
│   │   │   └── page.tsx       # Attendance marking
│   │   ├── fees/
│   │   │   ├── page.tsx       # Fee management
│   │   │   └── receipts/
│   │   │       └── page.tsx   # Receipt generation
│   │   └── exams/
│   │       ├── page.tsx       # Exam management
│   │       └── results/
│   │           └── page.tsx   # Results & report cards
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Shell.tsx
│   │   ├── students/
│   │   │   ├── AdmissionForm.tsx
│   │   │   └── StudentTable.tsx
│   │   ├── attendance/
│   │   │   └── AttendanceGrid.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   └── RecentActivity.tsx
│   │   └── fees/
│   │       └── PaymentForm.tsx
│   ├── lib/
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── utils.ts          # Helper functions
│   │   └── validations.ts    # Zod schemas
│   └── actions/
│       ├── student.ts        # Student CRUD server actions
│       ├── attendance.ts     # Attendance operations
│       ├── fees.ts           # Fee & payment operations
│       └── exams.ts          # Exam & result operations
├── public/
│   └── uploads/             # Student photos
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: Single Next.js project with App Router. Backend logic via Server Actions. Local SQLite storage via Prisma.

## Complexity Tracking

> *No constitution violations to justify*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Technical Decisions

### Decision 1: Database Choice - SQLite via Prisma

**Decision**: Use SQLite with Prisma ORM for local data storage.

**Rationale**:
- No external database server required (user preference for local storage)
- Prisma provides type-safe database access
- Easy migrations and schema management
- Sufficient for single-user, local application

**Alternatives Considered**:
- PostgreSQL: Rejected - requires separate server installation
- MongoDB: Rejected - overkill for structured relational data
- JSON files: Rejected - no query capabilities, concurrency issues

### Decision 2: UI Framework - Tailwind CSS + shadcn/ui

**Decision**: Use Tailwind CSS for styling with shadcn/ui component library.

**Rationale**:
- User selected this combination
- Professional, modern appearance out of box
- Highly customizable with color schemes
- Accessible components
- Large community and documentation

**Alternatives Considered**:
- Material UI: Rejected - user preference
- Chakra UI: Rejected - user preference

### Decision 3: State Management - Server Actions

**Decision**: Use Next.js Server Actions for data mutations instead of API routes.

**Rationale**:
- Simpler than creating separate API endpoints
- Built-in form handling with Next.js
- Type-safe from client to server
- Automatic loading and error states

**Alternatives Considered**:
- API Routes: Rejected - more boilerplate, separate client/server code
- tRPC: Rejected - overkill for single-project setup

### Decision 4: Form Validation - Zod

**Decision**: Use Zod for schema validation on both client and server.

**Rationale**:
- Works seamlessly with TypeScript
- Shared validation schemas between client/server
- Good error messages
- Integrates with React Hook Form

**Alternatives Considered**:
- Yup: Rejected - Zod has better TypeScript integration
- Manual validation: Rejected - error-prone, less maintainable

### Decision 5: Authentication - None

**Decision**: No authentication system for initial version.

**Rationale**:
- User is new to development
- Local-only application
- Single administrator use case
- Can add later if needed

**Alternatives Considered**:
- NextAuth.js: Deferred to future version
- Simple password: Deferred to future version

## Data Model

See `data-model.md` for complete schema.

### Core Entities

1. **Student** - 15 fields, relationships to Attendance, Payment, Result
2. **Attendance** - 4 fields, daily records per student
3. **FeeStructure** - 5 fields, defines fees per class
4. **Payment** - 5 fields, tracks student payments
5. **Exam** - 5 fields, defines examination
6. **Result** - 4 fields, stores exam results

### Relationships

```
Student (1) ──── (many) Attendance
Student (1) ──── (many) Payment
Student (1) ──── (many) Result
FeeStructure (1) ──── (many) Payment
Exam (1) ──── (many) Result
```

## API Contracts

See `contracts/` directory for OpenAPI schemas.

### Server Actions

| Module | Action | Description |
|--------|--------|-------------|
| Students | createStudent | Add new student |
| Students | updateStudent | Update student info |
| Students | deleteStudent | Remove student |
| Students | getStudents | List all students |
| Attendance | markAttendance | Mark daily attendance |
| Attendance | getAttendance | Get attendance records |
| Fees | createFeeStructure | Define fee structure |
| Fees | recordPayment | Record student payment |
| Fees | getDues | Get outstanding dues |
| Exams | createExam | Create new exam |
| Exams | enterMarks | Enter student marks |
| Exams | getResult | Get student result |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| SQLite performance with 500+ students | Low | Prisma query optimization, pagination |
| Data loss (local storage only) | Medium | Export/import feature, backup reminder |
| Mobile responsiveness | Medium | Mobile-first design, test on devices |
| Browser compatibility | Low | Modern browsers only, graceful degradation |

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- Project setup (Next.js, Tailwind, shadcn/ui)
- Prisma schema and database setup
- Layout components (Sidebar, Header)

### Phase 2: Student Module (Days 3-4)
- Admission form with validation
- Student list with search/filter
- Student detail view

### Phase 3: Attendance Module (Days 5-6)
- Attendance marking interface
- Attendance reports
- Attendance percentage calculations

### Phase 4: Dashboard (Day 7)
- Stats cards
- Recent activity feed
- Quick links

### Phase 5: Fee Module (Days 8-9)
- Fee structure management
- Payment recording
- Dues tracking and receipts

### Phase 6: Exam Module (Days 10-11)
- Exam creation
- Marks entry
- Report card generation

### Phase 7: Polish (Day 12)
- UI refinement
- Responsive testing
- Error handling
