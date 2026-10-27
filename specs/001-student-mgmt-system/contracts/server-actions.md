# Server Actions Contract: Student Management System

**Feature**: 001-student-mgmt-system  
**Date**: 2026-09-08  
**Type**: Next.js Server Actions

## Overview

All data operations are implemented as Next.js Server Actions. These are type-safe functions that run on the server and can be called directly from client components.

## Student Actions

### createStudent

**File**: `src/actions/student.ts`

**Input**:
```typescript
{
  firstName: string;      // min 2, max 50
  lastName: string;       // min 2, max 50
  rollNumber: string;     // min 1
  className: string;      // required
  section: string;        // required, single letter
  dateOfBirth: string;    // ISO date string
  gender: "male" | "female" | "other";
  contact: string;        // min 10 digits
  email?: string;         // optional, valid email
  address: string;        // min 5
  parentName: string;     // min 2
  parentContact: string;  // min 10 digits
  photo?: File;           // optional image
}
```

**Output**:
```typescript
{
  success: boolean;
  student?: Student;
  error?: string;
  fieldErrors?: Record<string, string>;
}
```

**Business Rules**:
- Auto-generate studentId (STU-YYYY-NNN)
- Validate unique rollNumber within class/section
- Store photo in public/uploads/

### updateStudent

**Input**: Same as createStudent, plus `id: string`

**Output**: Same as createStudent

### deleteStudent

**Input**: `{ id: string }`

**Output**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**Business Rules**:
- Check for dependent records (attendance, payments, results)
- Prevent deletion if dependencies exist
- Return list of dependencies if blocked

### getStudents

**Input**:
```typescript
{
  page?: number;          // default 1
  limit?: number;         // default 20
  search?: string;        // search name, rollNumber
  className?: string;     // filter by class
  section?: string;       // filter by section
}
```

**Output**:
```typescript
{
  success: boolean;
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
}
```

### getStudentById

**Input**: `{ id: string }`

**Output**:
```typescript
{
  success: boolean;
  student?: Student;
  error?: string;
}
```

## Attendance Actions

### markAttendance

**Input**:
```typescript
{
  date: string;           // ISO date string
  className: string;
  records: Array<{
    studentId: string;
    status: "present" | "absent" | "leave";
  }>;
}
```

**Output**:
```typescript
{
  success: boolean;
  marked: number;
  error?: string;
}
```

**Business Rules**:
- Upsert: if record exists for date, update status
- Validate all studentIds belong to className

### getAttendance

**Input**:
```typescript
{
  date: string;
  className: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  records: Array<{
    student: Student;
    status: "present" | "absent" | "leave";
  }>;
  summary: {
    total: number;
    present: number;
    absent: number;
    leave: number;
    percentage: number;
  };
}
```

### getStudentAttendance

**Input**: `{ studentId: string; startDate?: string; endDate?: string }`

**Output**:
```typescript
{
  success: boolean;
  records: Array<{
    date: string;
    status: string;
  }>;
  percentage: number;
}
```

## Fee Actions

### createFeeStructure

**Input**:
```typescript
{
  className: string;
  feeType: string;
  amount: number;
  dueDate: string;
  academicYear: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  feeStructure?: FeeStructure;
  error?: string;
}
```

### recordPayment

**Input**:
```typescript
{
  studentId: string;
  feeStructureId: string;
  amountPaid: number;
  paymentDate: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  payment?: Payment;
  receiptNumber?: string;
  error?: string;
}
```

**Business Rules**:
- Auto-generate receiptNumber (REC-YYYYMMDD-NNN)
- Validate amountPaid > 0
- Allow overpayment (advance)

### getDues

**Input**:
```typescript
{
  className?: string;     // filter by class
  studentId?: string;     // filter by student
}
```

**Output**:
```typescript
{
  success: boolean;
  dues: Array<{
    student: Student;
    feeStructure: FeeStructure;
    totalDue: number;
    totalPaid: number;
    outstanding: number;
  }>;
  totalOutstanding: number;
}
```

### getPayments

**Input**:
```typescript
{
  studentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

**Output**:
```typescript
{
  success: boolean;
  payments: Array<{
    payment: Payment;
    student: Student;
    feeStructure: FeeStructure;
  }>;
  total: number;
  collected: number;
}
```

## Exam Actions

### createExam

**Input**:
```typescript
{
  name: string;
  className: string;
  subjects: string[];
  maxMarks: Record<string, number>;
  examDate: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  exam?: Exam;
  error?: string;
}
```

### enterMarks

**Input**:
```typescript
{
  examId: string;
  records: Array<{
    studentId: string;
    marks: Record<string, number>;
  }>;
}
```

**Output**:
```typescript
{
  success: boolean;
  entered: number;
  error?: string;
}
```

**Business Rules**:
- Validate marks <= maxMarks for each subject
- Calculate totalMarks and percentage automatically
- Compute grade based on percentage

### getResult

**Input**: `{ examId: string; studentId: string }`

**Output**:
```typescript
{
  success: boolean;
  result?: Result;
  exam?: Exam;
  student?: Student;
  error?: string;
}
```

### getClassResults

**Input**: `{ examId: string; className: string }`

**Output**:
```typescript
{
  success: boolean;
  results: Array<{
    student: Student;
    result: Result;
  }>;
  statistics: {
    average: number;
    highest: number;
    lowest: number;
    passRate: number;
  };
}
```

## Error Handling

All actions follow consistent error handling:

```typescript
{
  success: false;
  error: "Human-readable error message";
  code?: "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "DEPENDENCY_ERROR";
  fieldErrors?: Record<string, string>;  // For validation errors
}
```

## Loading States

Client components should use React's useTransition or useFormState for loading states:

```typescript
const [isPending, startTransition] = useTransition();

// Wrap action calls
startTransition(async () => {
  const result = await createStudent(formData);
  if (result.success) {
    router.push('/students');
  }
});
```
