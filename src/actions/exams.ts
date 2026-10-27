"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { calculateGrade } from "@/lib/utils"

export async function createExam(data: {
  name: string
  className: string
  subjects: string[]
  maxMarks: Record<string, number>
  examDate: string
}) {
  try {
    const exam = await prisma.exam.create({
      data: {
        name: data.name,
        className: data.className,
        subjects: JSON.stringify(data.subjects),
        maxMarks: JSON.stringify(data.maxMarks),
        examDate: new Date(data.examDate),
      },
    })

    revalidatePath("/exams")

    return { success: true, exam }
  } catch (error) {
    console.error("Error creating exam:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create exam",
    }
  }
}

export async function enterMarks(data: {
  examId: string
  records: Array<{
    studentId: string
    marks: Record<string, number>
  }>
}) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
    })

    if (!exam) {
      return { success: false, error: "Exam not found" }
    }

    const maxMarks = JSON.parse(exam.maxMarks) as Record<string, number>

    for (const record of data.records) {
      let totalMarks = 0
      let totalMaxMarks = 0

      for (const [subject, marks] of Object.entries(record.marks)) {
        totalMarks += marks
        totalMaxMarks += maxMarks[subject] || 0
      }

      const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0
      const grade = calculateGrade(percentage)

      await prisma.result.upsert({
        where: {
          examId_studentId: {
            examId: data.examId,
            studentId: record.studentId,
          },
        },
        update: {
          marks: JSON.stringify(record.marks),
          totalMarks,
          percentage,
          grade,
        },
        create: {
          examId: data.examId,
          studentId: record.studentId,
          marks: JSON.stringify(record.marks),
          totalMarks,
          percentage,
          grade,
        },
      })
    }

    revalidatePath("/exams/results")

    return { success: true, entered: data.records.length }
  } catch (error) {
    console.error("Error entering marks:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to enter marks",
    }
  }
}

export async function getResult(params: {
  examId: string
  studentId: string
}) {
  try {
    const [result, exam, student] = await Promise.all([
      prisma.result.findUnique({
        where: {
          examId_studentId: {
            examId: params.examId,
            studentId: params.studentId,
          },
        },
      }),
      prisma.exam.findUnique({
        where: { id: params.examId },
      }),
      prisma.student.findUnique({
        where: { id: params.studentId },
      }),
    ])

    if (!result || !exam || !student) {
      return { success: false, error: "Result not found" }
    }

    return { success: true, result, exam, student }
  } catch (error) {
    console.error("Error fetching result:", error)
    return { success: false, error: "Failed to fetch result" }
  }
}

export async function getClassResults(params: {
  examId: string
  className: string
}) {
  try {
    const [exam, students, results] = await Promise.all([
      prisma.exam.findUnique({
        where: { id: params.examId },
      }),
      prisma.student.findMany({
        where: { className: params.className },
      }),
      prisma.result.findMany({
        where: { examId: params.examId },
        include: { student: true },
      }),
    ])

    if (!exam) {
      return { success: false, error: "Exam not found" }
    }

    const resultsWithStudents = students.map((student) => {
      const result = results.find((r) => r.studentId === student.id)
      return {
        student,
        result: result || null,
      }
    })

    // Calculate statistics
    const validResults = results.filter((r) => r.student.className === params.className)
    const average = validResults.length > 0
      ? validResults.reduce((sum, r) => sum + r.percentage, 0) / validResults.length
      : 0
    const highest = validResults.length > 0
      ? Math.max(...validResults.map((r) => r.percentage))
      : 0
    const lowest = validResults.length > 0
      ? Math.min(...validResults.map((r) => r.percentage))
      : 0
    const passRate = validResults.length > 0
      ? (validResults.filter((r) => r.percentage >= 40).length / validResults.length) * 100
      : 0

    return {
      success: true,
      results: resultsWithStudents,
      statistics: {
        average: Math.round(average * 100) / 100,
        highest,
        lowest,
        passRate: Math.round(passRate),
      },
    }
  } catch (error) {
    console.error("Error fetching class results:", error)
    return {
      success: false,
      results: [],
      statistics: {
        average: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
      },
    }
  }
}

export async function getExam(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    })

    return { success: true, exam }
  } catch (error) {
    console.error("Error fetching exam:", error)
    return { success: false, exam: null }
  }
}

export async function getStudentsByClass(params: { className: string }) {
  try {
    const students = await prisma.student.findMany({
      where: { className: params.className },
      orderBy: { rollNumber: "asc" },
    })

    return { success: true, students }
  } catch (error) {
    console.error("Error fetching students:", error)
    return { success: false, students: [] }
  }
}

export async function getExams() {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { examDate: "desc" },
    })

    return { success: true, exams }
  } catch (error) {
    console.error("Error fetching exams:", error)
    return { success: false, exams: [] }
  }
}

export async function deleteExam(examId: string) {
  try {
    await prisma.exam.delete({
      where: { id: examId },
    })

    revalidatePath("/exams")
    revalidatePath("/exams/results")

    return { success: true }
  } catch (error) {
    console.error("Error deleting exam:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete exam",
    }
  }
}
