# Tasks: Student Management System

**Input**: Design documents from `/specs/001-student-mgmt-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in feature specification - excluded from tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create Next.js project with TypeScript and Tailwind CSS
- [X] T002 Install Prisma and initialize SQLite database
- [X] T003 Install shadcn/ui and required components (button, input, card, table, select, label)
- [X] T004 Install Zod and React Hook Form for validation
- [X] T005 [P] Configure Tailwind CSS with custom color theme (primary blue, accent purple)
- [X] T006 [P] Create directory structure: src/app, src/components, src/lib, src/actions, prisma

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create Prisma schema with all 6 entities (Student, Attendance, FeeStructure, Payment, Exam, Result)
- [X] T008 Run Prisma migration to create database
- [X] T009 Create Prisma client singleton in src/lib/db.ts
- [X] T010 Create utility functions in src/lib/utils.ts (cn, formatDate, generateStudentId)
- [X] T011 Create Zod validation schemas in src/lib/validations.ts
- [X] T012 Create root layout with sidebar navigation in src/app/layout.tsx
- [X] T013 Create Sidebar component in src/components/layout/Sidebar.tsx
- [X] T014 [P] Create Header component in src/components/layout/Header.tsx
- [X] T015 [P] Create Shell layout wrapper in src/components/layout/Shell.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Student Admission (Priority: P1) 🎯 MVP

**Goal**: Register new students through comprehensive admission form

**Independent Test**: Fill admission form, submit, verify student appears in list with all details

### Implementation for User Story 1

- [X] T016 [P] [US1] Create Student model validation schema in src/lib/validations.ts
- [X] T017 [P] [US1] Create student server actions in src/actions/student.ts (createStudent, getStudents, getStudentById)
- [X] T018 [P] [US1] Create AdmissionForm component in src/components/students/AdmissionForm.tsx
- [X] T019 [P] [US1] Create StudentTable component in src/components/students/StudentTable.tsx
- [X] T020 [US1] Create admission page in src/app/students/admission/page.tsx
- [X] T021 [US1] Create student list page in src/app/students/page.tsx
- [X] T022 [US1] Create student detail page in src/app/students/[id]/page.tsx
- [X] T023 [US1] Add form validation and error handling to AdmissionForm
- [X] T024 [US1] Add duplicate roll number validation in createStudent action

**Checkpoint**: Student admission fully functional - can add and list students

---

## Phase 4: User Story 2 - Attendance Management (Priority: P2)

**Goal**: Mark daily attendance for students and generate reports

**Independent Test**: Select class, mark attendance, save, verify records stored correctly

### Implementation for User Story 2

- [X] T025 [P] [US2] Create Attendance model validation schema in src/lib/validations.ts
- [X] T026 [P] [US2] Create attendance server actions in src/actions/attendance.ts (markAttendance, getAttendance, getStudentAttendance)
- [X] T027 [P] [US2] Create AttendanceGrid component in src/components/attendance/AttendanceGrid.tsx
- [X] T028 [US2] Create attendance page in src/app/attendance/page.tsx
- [X] T029 [US2] Add class selector and date picker to attendance page
- [X] T030 [US2] Implement attendance summary display (present/absent/leave counts)
- [X] T031 [US2] Add attendance percentage calculation

**Checkpoint**: Attendance marking functional for any class/date

---

## Phase 5: User Story 3 - Student Dashboard (Priority: P3)

**Goal**: Display key statistics and recent activity at a glance

**Independent Test**: Load dashboard, verify all statistics display accurate real-time data

### Implementation for User Story 3

- [X] T032 [P] [US3] Create StatsCard component in src/components/dashboard/StatsCard.tsx
- [X] T033 [P] [US3] Create RecentActivity component in src/components/dashboard/RecentActivity.tsx
- [X] T034 [US3] Create dashboard page in src/app/page.tsx
- [X] T035 [US3] Add dashboard statistics aggregation (total students, today's attendance)
- [X] T036 [US3] Add recent admissions list to dashboard
- [X] T037 [US3] Add fee collection summary to dashboard

**Checkpoint**: Dashboard shows accurate statistics from all modules

---

## Phase 6: User Story 4 - Fee Management (Priority: P4)

**Goal**: Manage fee structures, record payments, and track dues

**Independent Test**: Create fee structure, record payment, verify dues calculated correctly

### Implementation for User Story 4

- [X] T038 [P] [US4] Create FeeStructure and Payment validation schemas in src/lib/validations.ts
- [X] T039 [P] [US4] Create fee server actions in src/actions/fees.ts (createFeeStructure, recordPayment, getDues, getPayments)
- [X] T040 [P] [US4] Create PaymentForm component in src/components/fees/PaymentForm.tsx
- [X] T041 [US4] Create fee management page in src/app/fees/page.tsx
- [X] T042 [US4] Create fee structure management section
- [X] T043 [US4] Create payment recording interface
- [X] T044 [US4] Create dues tracking view
- [X] T045 [US4] Create receipt generation page in src/app/fees/receipts/page.tsx

**Checkpoint**: Fee management fully functional with receipts

---

## Phase 7: User Story 5 - Exam Results (Priority: P5)

**Goal**: Manage exams, record results, and generate report cards

**Independent Test**: Create exam, enter marks, verify report card generated correctly

### Implementation for User Story 5

- [X] T046 [P] [US5] Create Exam and Result validation schemas in src/lib/validations.ts
- [X] T047 [P] [US5] Create exam server actions in src/actions/exams.ts (createExam, enterMarks, getResult, getClassResults)
- [X] T048 [P] [US5] Create report card component for printing
- [X] T049 [US5] Create exam management page in src/app/exams/page.tsx
- [X] T050 [US5] Create marks entry interface
- [X] T051 [US5] Create results page in src/app/exams/results/page.tsx
- [X] T052 [US5] Implement grade calculation logic (A+, A, B+, B, C, D, F)
- [X] T053 [US5] Add class performance analytics

**Checkpoint**: Exam results and report cards fully functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T054 [P] Add loading states to all pages using React Suspense
- [X] T055 [P] Add error boundaries for each route segment
- [X] T056 [P] Ensure responsive design on mobile (320px+)
- [X] T057 Add empty state displays for all lists
- [X] T058 Add confirmation dialogs for delete operations
- [X] T059 Add toast notifications for success/error feedback
- [X] T060 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel OR sequentially in priority order
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May show student names from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Aggregates data from US1, US2, US4
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires students from US1
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Requires students from US1

### Within Each User Story

- Models/schemas before actions
- Actions before components
- Components before pages
- Core implementation before polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- Different user stories can be worked on simultaneously

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tasks together:
Task: "Create Student validation schema in src/lib/validations.ts"
Task: "Create student server actions in src/actions/student.ts"
Task: "Create AdmissionForm component in src/components/students/AdmissionForm.tsx"
Task: "Create StudentTable component in src/components/students/StudentTable.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test Student Admission independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

---

## Task Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1: Setup | 6 | - |
| Phase 2: Foundational | 9 | - |
| Phase 3: Student Admission | 9 | US1 |
| Phase 4: Attendance | 7 | US2 |
| Phase 5: Dashboard | 6 | US3 |
| Phase 6: Fee Management | 8 | US4 |
| Phase 7: Exam Results | 8 | US5 |
| Phase 8: Polish | 7 | - |
| **Total** | **60** | - |

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
