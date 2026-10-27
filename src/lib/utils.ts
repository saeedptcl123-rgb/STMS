import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function generateStudentId(year: number, count: number): string {
  const yr = year.toString().slice(-2)
  const num = count.toString().padStart(3, '0')
  return `STU-${yr}-${num}`
}

export function generateReceiptNumber(date: Date, count: number): string {
  const d = date.toISOString().slice(0, 10).replace(/-/g, '')
  const num = count.toString().padStart(3, '0')
  return `REC-${d}-${num}`
}

export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C'
  if (percentage >= 40) return 'D'
  return 'F'
}
