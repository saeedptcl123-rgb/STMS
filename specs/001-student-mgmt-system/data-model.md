# Data Model: Student Management System

**Feature**: 001-student-mgmt-system  
**Date**: 2026-09-08  
**Database**: SQLite via Prisma ORM

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Student     │     │   Attendance    │     │  FeeStructure   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │────<│ id              │     │ id              │
│ studentId       │     │ studentId       │     │ className       │
│ firstName       │     │ date            │     │ feeType         │
│ lastName        │     │ status          │     │ amount          │
│ rollNumber      │     │ classId         │     │ dueDate         │
│ className       │     │ createdAt       │     │ academicYear    │
│ section         │     └─────────────────┘     │ createdAt       │
│ dateOfBirth     │                             └─────────────────┘
│ gender          │                                    │
│ contact         │                                    │
│ email           │                                    │
│ address         │     ┌─────────────────┐            │
│ parentName      │     │     Payment     │<───────────┘
│ parentContact   │     ├─────────────────┤
│ admissionDate   │────<│ id              │
│ photo           │     │ studentId       │
│ createdAt       │     │ feeStructureId  │
│ updatedAt       │     │ amountPaid      │
└─────────────────┘     │ paymentDate     │
                        │ receiptNumber   │
                        │ createdAt       │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│      Exam       │     │     Result      │
├─────────────────┤     ├─────────────────┤
│ id              │────<│ id              │
│ name            │     │ examId          │
│ className       │     │ studentId       │
│ subjects        │     │ marks           │
│ maxMarks        │     │ totalMarks      │
│ examDate        │     │ percentage      │
│ createdAt       │     │ grade           │
└─────────────────┘     │ createdAt       │
                        └─────────────────┘
```

## Entity Definitions

### 1. Student

Represents a student enrolled in the school.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | String (CUID) | Yes | Yes | Primary key |
| studentId | String | Yes | Yes | Auto-generated student ID (e.g., STU-2026-001) |
| firstName | String | Yes | No | Student's first name |
| lastName | String | Yes | No | Student's last name |
| rollNumber | String | Yes | No | Roll number within class |
| className | String | Yes | No | Class name (e.g., "10", "12") |
| section | String | Yes | No | Section (e.g., "A", "B") |
| dateOfBirth | DateTime | Yes | No | Date of birth |
| gender | String | Yes | No | Male/Female/Other |
| contact | String | Yes | No | Phone number |
| email | String | No | No | Email address (optional) |
| address | String | Yes | No | Full address |
| parentName | String | Yes | No | Parent/Guardian name |
| parentContact | String | Yes | No | Parent/Guardian phone |
| admissionDate | DateTime | Yes | No | Date of admission |
| photo | String | No | No | Photo file path |
| createdAt | DateTime | Yes | No | Record creation time |
| updatedAt | DateTime | Yes | No | Last update time |

**Unique Constraint**: (rollNumber, className, section) - No duplicate roll numbers in same class/section

### 2. Attendance

Daily attendance records for students.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | String (CUID) | Yes | Yes | Primary key |
| studentId | String | Yes | No | Reference to Student |
| date | DateTime | Yes | No | Attendance date |
| status | String | Yes | No | Present/Absent/Leave |
| classId | String | Yes | No | Class identifier |
| createdAt | DateTime | Yes | No | Record creation time |

**Unique Constraint**: (studentId, date) - One record per student per day

### 3. FeeStructure

Defines fee amounts for different classes.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | String (CUID) | Yes | Yes | Primary key |
| className | String | Yes | No | Class name |
| feeType | String | Yes | No | Tuition/Exam/Lab/etc. |
| amount | Float | Yes | No | Fee amount |
| dueDate | DateTime | Yes | No | Payment due date |
| academicYear | String | Yes | No | Academic year (e.g., "2026-2027") |
| createdAt | DateTime | Yes | No | Record creation time |

### 4. Payment

Records fee payments made by students.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | String (CUID) | Yes | Yes | Primary key |
| studentId | String | Yes | No | Reference to Student |
| feeStructureId | String | Yes | No | Reference to FeeStructure |
| amountPaid | Float | Yes | No | Amount paid |
| paymentDate | DateTime | Yes | No | Date of payment |
| receiptNumber | String | Yes | Yes | Unique receipt number |
| createdAt | DateTime | Yes | No | Record creation time |

### 5. Exam

Represents an examination.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | String (CUID) | Yes | Yes | Primary key |
| name | String | Yes | No | Exam name (e.g., "Midterm", "Final") |
| className | String | Yes | No | Class name |
| subjects | String | Yes | No | JSON array of subjects |
| maxMarks | String | Yes | No | JSON object: subject → max marks |
| examDate | DateTime | Yes | No | Exam date |
| createdAt | DateTime | Yes | No | Record creation time |

### 6. Result

Stores exam results for students.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | String (CUID) | Yes | Yes | Primary key |
| examId | String | Yes | No | Reference to Exam |
| studentId | String | Yes | No | Reference to Student |
| marks | String | Yes | No | JSON object: subject → marks obtained |
| totalMarks | Float | Yes | No | Sum of all marks |
| percentage | Float | Yes | No | Percentage score |
| grade | String | Yes | No | Letter grade (A+, A, B+, etc.) |
| createdAt | DateTime | Yes | No | Record creation time |

**Unique Constraint**: (examId, studentId) - One result per student per exam

## Validation Rules

### Student
- firstName: min 2 chars, max 50 chars
- lastName: min 2 chars, max 50 chars
- rollNumber: min 1 char, alphanumeric
- className: required, one of predefined values
- section: required, single letter (A-Z)
- dateOfBirth: valid date, student age 3-25
- gender: "male" | "female" | "other"
- contact: min 10 digits
- email: valid email format (optional)
- address: min 5 chars
- parentName: min 2 chars
- parentContact: min 10 digits

### Attendance
- studentId: must reference existing student
- date: valid date, not future
- status: "present" | "absent" | "leave"

### FeeStructure
- className: required
- feeType: min 1 char
- amount: positive number
- dueDate: valid date
- academicYear: format "YYYY-YYYY"

### Payment
- studentId: must reference existing student
- feeStructureId: must reference existing fee structure
- amountPaid: positive number
- paymentDate: valid date, not future
- receiptNumber: auto-generated, unique

### Exam
- name: min 1 char
- className: required
- subjects: JSON array, min 1 subject
- maxMarks: JSON object, all values positive
- examDate: valid date

### Result
- examId: must reference existing exam
- studentId: must reference existing student
- marks: JSON object, all values >= 0
- totalMarks: sum of marks values
- percentage: 0-100
- grade: computed from percentage

## Grade Scale

| Percentage | Grade |
|------------|-------|
| 90-100 | A+ |
| 80-89 | A |
| 70-79 | B+ |
| 60-69 | B |
| 50-59 | C |
| 40-49 | D |
| 0-39 | F |

## Migration Strategy

1. Initial schema creation via `prisma migrate dev`
2. Seed data for test classes (1-12, sections A-D)
3. No data migration needed (new project)

## Indexes

- Student: (className, section), (rollNumber)
- Attendance: (date), (studentId, date)
- Payment: (studentId), (paymentDate)
- Result: (examId, studentId)
