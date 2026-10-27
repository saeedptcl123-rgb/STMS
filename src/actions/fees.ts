"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateReceiptNumber } from "@/lib/utils"

export async function createFeeStructure(data: {
  className: string
  feeType: string
  amount: number
  dueDate: string
  academicYear: string
}) {
  try {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        className: data.className,
        feeType: data.feeType,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        academicYear: data.academicYear,
      },
    })

    revalidatePath("/fees")

    return { success: true, feeStructure }
  } catch (error) {
    console.error("Error creating fee structure:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create fee structure",
    }
  }
}

export async function recordPayment(data: {
  studentId: string
  feeStructureId: string
  amountPaid: number
  paymentDate: string
}) {
  try {
    // Generate receipt number
    const paymentCount = await prisma.payment.count()
    const receiptNumber = generateReceiptNumber(new Date(), paymentCount + 1)

    // Convert amountPaid to valid number (prevent NaN)
    const amountPaid = Number(data.amountPaid)
    if (isNaN(amountPaid) || amountPaid <= 0) {
      return { success: false, error: "Invalid payment amount" }
    }

    // Convert empty string feeStructureId to undefined, also exclude "none"
    const feeStructureId = data.feeStructureId && data.feeStructureId.trim() !== "" && data.feeStructureId.toLowerCase() !== "none" ? data.feeStructureId : undefined

    // Build payment data with relation connects
    const paymentData: any = {
      student: { connect: { id: data.studentId } },
      amountPaid,
      paymentDate: new Date(data.paymentDate),
      receiptNumber,
    }

    if (feeStructureId) {
      paymentData.feeStructure = { connect: { id: feeStructureId } }
    }

    const payment = await prisma.payment.create({
      data: paymentData,
    })

    revalidatePath("/fees")
    revalidatePath("/fees/receipts")

    return { success: true, payment, receiptNumber }
  } catch (error) {
    console.error("Error recording payment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record payment",
    }
  }
}

export async function getDues(params?: {
  className?: string
  studentId?: string
}) {
  try {
    const where: any = {}

    if (params?.className) {
      where.className = params.className
    }

    if (params?.studentId) {
      where.id = params.studentId
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        payments: {
          include: {
            feeStructure: true,
          },
        },
      },
    })

    const dues = students.map((student) => {
      const totalPaid = student.payments.reduce((sum, p) => sum + p.amountPaid, 0)
      // For simplicity, assume each student should pay based on their class fee structure
      // In a real app, this would be more complex
      const totalDue = 10000 // Placeholder - should be calculated from fee structures
      const outstanding = totalDue - totalPaid

      return {
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          className: student.className,
          section: student.section,
        },
        totalDue,
        totalPaid,
        outstanding: Math.max(0, outstanding),
      }
    })

    const totalOutstanding = dues.reduce((sum, d) => sum + d.outstanding, 0)

    return {
      success: true,
      dues,
      totalOutstanding,
    }
  } catch (error) {
    console.error("Error fetching dues:", error)
    return {
      success: false,
      dues: [],
      totalOutstanding: 0,
    }
  }
}

export async function getPayments(params?: {
  studentId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  search?: string
}) {
  try {
    const { page = 1, limit = 20, studentId, startDate, endDate, search } = params || {}

    const where: any = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (startDate || endDate) {
      where.paymentDate = {}
      if (startDate) where.paymentDate.gte = new Date(startDate)
      if (endDate) where.paymentDate.lte = new Date(endDate)
    }

    if (search) {
      where.OR = [
        { receiptNumber: { contains: search } },
        { student: { firstName: { contains: search } } },
        { student: { lastName: { contains: search } } },
        { student: { studentId: { contains: search } } },
      ]
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          student: true,
          feeStructure: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { paymentDate: "desc" },
      }),
      prisma.payment.count({ where }),
    ])

    const collected = payments.reduce((sum, p) => sum + p.amountPaid, 0)

    return {
      success: true,
      payments,
      total,
      totalPages: Math.ceil(total / limit),
      collected,
    }
  } catch (error) {
    console.error("Error fetching payments:", error)
    return {
      success: false,
      payments: [],
      total: 0,
      totalPages: 0,
      collected: 0,
    }
  }
}

export async function getFeeStructures() {
  try {
    const feeStructures = await prisma.feeStructure.findMany({
      orderBy: { createdAt: "desc" },
    })

    return { success: true, feeStructures }
  } catch (error) {
    console.error("Error fetching fee structures:", error)
    return { success: false, feeStructures: [] }
  }
}

export async function getPaymentByReceipt(receiptNumber: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { receiptNumber },
      include: {
        student: true,
        feeStructure: true,
      },
    })

    if (!payment) {
      return { success: false, error: "Payment not found" }
    }

    return { success: true, payment }
  } catch (error) {
    console.error("Error fetching payment:", error)
    return { success: false, error: "Failed to fetch payment" }
  }
}

export async function voidPayment(receiptNumber: string, reason?: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { receiptNumber },
    })

    if (!payment) {
      return { success: false, error: "Payment not found" }
    }

    if (payment.isVoided) {
      return { success: false, error: "Payment is already voided" }
    }

    await prisma.payment.update({
      where: { receiptNumber },
      data: {
        isVoided: true,
        voidedAt: new Date(),
        voidReason: reason || "Voided by admin",
      },
    })

    revalidatePath("/fees")
    revalidatePath("/fees/receipts")

    return { success: true, message: "Payment voided successfully" }
  } catch (error) {
    console.error("Error voiding payment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to void payment",
    }
  }
}

export async function deletePayment(receiptNumber: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { receiptNumber },
    })

    if (!payment) {
      return { success: false, error: "Payment not found" }
    }

    await prisma.payment.delete({
      where: { receiptNumber },
    })

    revalidatePath("/fees")
    revalidatePath("/fees/receipts")

    return { success: true, message: "Payment permanently deleted" }
  } catch (error) {
    console.error("Error deleting payment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete payment",
    }
  }
}

export async function restorePayment(receiptNumber: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { receiptNumber },
    })

    if (!payment) {
      return { success: false, error: "Payment not found" }
    }

    if (!payment.isVoided) {
      return { success: false, error: "Payment is not voided" }
    }

    await prisma.payment.update({
      where: { receiptNumber },
      data: {
        isVoided: false,
        voidedAt: null,
        voidReason: null,
      },
    })

    revalidatePath("/fees")
    revalidatePath("/fees/receipts")

    return { success: true, message: "Payment restored successfully" }
  } catch (error) {
    console.error("Error restoring payment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore payment",
    }
  }
}
