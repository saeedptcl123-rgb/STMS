import { z } from 'zod'

export const studentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  className: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], { error: 'Gender is required' }),
  contact: z.string().min(10, 'Contact must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters'),
  parentContact: z.string().min(10, 'Parent contact must be at least 10 digits'),
})

export type StudentFormData = z.infer<typeof studentSchema>

export const attendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  className: z.string().min(1, 'Class is required'),
  records: z.array(z.object({
    studentId: z.string(),
    status: z.enum(['present', 'absent', 'leave']),
  })),
})

export type AttendanceFormData = z.infer<typeof attendanceSchema>

export const feeStructureSchema = z.object({
  className: z.string().min(1, 'Class is required'),
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
})

export type FeeStructureFormData = z.infer<typeof feeStructureSchema>

export const paymentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  feeStructureId: z.string().min(1, 'Fee structure is required'),
  amountPaid: z.number().positive('Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
})

export type PaymentFormData = z.infer<typeof paymentSchema>

export const examSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  className: z.string().min(1, 'Class is required'),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  maxMarks: z.record(z.string(), z.number().positive('Max marks must be positive')),
  examDate: z.string().min(1, 'Exam date is required'),
})

export type ExamFormData = z.infer<typeof examSchema>

export const marksSchema = z.object({
  examId: z.string().min(1, 'Exam is required'),
  records: z.array(z.object({
    studentId: z.string(),
    marks: z.record(z.string(), z.number().min(0, 'Marks cannot be negative')),
  })),
})

export type MarksFormData = z.infer<typeof marksSchema>
