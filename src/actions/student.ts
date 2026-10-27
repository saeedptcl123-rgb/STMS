"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateStudentId } from "@/lib/utils"
import { studentSchema } from "@/lib/validations"

export async function createStudent(formData: FormData) {
  try {
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      rollNumber: formData.get("rollNumber") as string,
      className: formData.get("className") as string,
      section: formData.get("section") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as "male" | "female" | "other",
      contact: formData.get("contact") as string,
      email: formData.get("email") as string || undefined,
      address: formData.get("address") as string,
      parentName: formData.get("parentName") as string,
      parentContact: formData.get("parentContact") as string,
    }

    const validatedData = studentSchema.parse(data)

    // Check for duplicate roll number in same class/section
    const existingStudent = await prisma.student.findFirst({
      where: {
        rollNumber: validatedData.rollNumber,
        className: validatedData.className,
        section: validatedData.section,
      },
    })

    if (existingStudent) {
      return {
        success: false,
        error: "A student with this roll number already exists in this class/section",
      }
    }

    // Generate student ID
    const year = new Date().getFullYear()
    const studentCount = await prisma.student.count()
    const studentId = generateStudentId(year, studentCount + 1)

    const student = await prisma.student.create({
      data: {
        studentId,
        ...validatedData,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        admissionDate: new Date(),
      },
    })

    revalidatePath("/students")
    revalidatePath("/")

    return { success: true, student }
  } catch (error) {
    console.error("Error creating student:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create student",
    }
  }
}

export async function getStudents(params?: {
  page?: number
  limit?: number
  search?: string
  className?: string
  section?: string
  includeInactive?: boolean
}) {
  try {
    const { page = 1, limit = 20, search, className, section, includeInactive = false } = params || {}

    const where: any = {}

    if (!includeInactive) {
      where.isActive = true
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { studentId: { contains: search } },
        { rollNumber: { contains: search } },
      ]
    }

    if (className) {
      where.className = className
    }

    if (section) {
      where.section = section
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ])

    return {
      success: true,
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Error fetching students:", error)
    return {
      success: false,
      students: [],
      total: 0,
      page: 1,
      totalPages: 0,
    }
  }
}

export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
    })

    if (!student) {
      return { success: false, error: "Student not found" }
    }

    return { success: true, student }
  } catch (error) {
    console.error("Error fetching student:", error)
    return { success: false, error: "Failed to fetch student" }
  }
}

export async function updateStudent(id: string, formData: FormData) {
  try {
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      rollNumber: formData.get("rollNumber") as string,
      className: formData.get("className") as string,
      section: formData.get("section") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as "male" | "female" | "other",
      contact: formData.get("contact") as string,
      email: formData.get("email") as string || undefined,
      address: formData.get("address") as string,
      parentName: formData.get("parentName") as string,
      parentContact: formData.get("parentContact") as string,
    }

    const validatedData = studentSchema.parse(data)

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...validatedData,
        dateOfBirth: new Date(validatedData.dateOfBirth),
      },
    })

    revalidatePath("/students")
    revalidatePath(`/students/${id}`)

    return { success: true, student }
  } catch (error) {
    console.error("Error updating student:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update student",
    }
  }
}

export async function deleteStudent(id: string, options?: { forceCascade?: boolean }) {
  try {
    const { forceCascade = false } = options || {}

    const student = await prisma.student.findUnique({
      where: { id },
      select: { isActive: true, firstName: true, lastName: true },
    })

    if (!student) {
      return { success: false, error: "Student not found" }
    }

    if (forceCascade) {
      await prisma.student.delete({
        where: { id },
      })

      revalidatePath("/students")
      revalidatePath("/")

      return { success: true, message: "Student permanently deleted with all related records" }
    }

    if (!student.isActive) {
      return { success: false, error: "Student is already marked as inactive" }
    }

    await prisma.student.update({
      where: { id },
      data: { isActive: false },
    })

    revalidatePath("/students")
    revalidatePath("/")

    return { success: true, message: "Student marked as inactive (Left). Historical records preserved." }
  } catch (error) {
    console.error("Error deleting student:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete student",
    }
  }
}
