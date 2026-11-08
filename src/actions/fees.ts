"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateReceiptNumber } from "@/lib/utils"
import { DEFAULT_FEE_TYPES, loadSchoolSettings } from "@/lib/school"

function revalidateFees() {
  revalidatePath("/fees", "layout")
  revalidatePath("/fees/receipts")
  revalidatePath("/students", "layout")
  revalidatePath("/", "layout")
}

// ---------- Fee types ----------

export async function getFeeTypes() {
  try {
    let feeTypes = await prisma.feeType.findMany({ orderBy: { name: "asc" } })

    // First run: seed the common school fee types so the admin can start quickly.
    if (feeTypes.length === 0) {
      await prisma.feeType.createMany({
        data: DEFAULT_FEE_TYPES.map((name) => ({ name })),
        skipDuplicates: true,
      })
      feeTypes = await prisma.feeType.findMany({ orderBy: { name: "asc" } })
    }

    return { success: true, feeTypes }
  } catch (error) {
    console.error("Error fetching fee types:", error)
    return { success: false, feeTypes: [] }
  }
}

export async function createFeeType(name: string) {
  try {
    const clean = name.trim()
    if (!clean) return { success: false, error: "Fee type ka naam likhein" }

    const feeType = await prisma.feeType.create({ data: { name: clean } })
    revalidatePath("/fees/setup")
    return { success: true, feeType }
  } catch (error) {
    console.error("Error creating fee type:", error)
    const duplicate = error instanceof Error && error.message.includes("Unique constraint")
    return {
      success: false,
      error: duplicate ? "Ye fee type pehle se maujood hai" : "Fee type save nahi ho saka",
    }
  }
}

export async function deleteFeeType(id: string) {
  try {
    const feeType = await prisma.feeType.findUnique({ where: { id } })
    if (!feeType) return { success: false, error: "Fee type nahi mila" }

    const inUse = await prisma.feeStructure.count({ where: { feeType: feeType.name } })
    if (inUse > 0) {
      return { success: false, error: "Ye fee type fee structure mein istemal ho rahi hai, pehle wo structures delete karein" }
    }

    await prisma.feeType.delete({ where: { id } })
    revalidatePath("/fees/setup")
    return { success: true }
  } catch (error) {
    console.error("Error deleting fee type:", error)
    return { success: false, error: "Fee type delete nahi ho saka" }
  }
}

// ---------- Fee structures (class-wise fee amounts with due dates) ----------

export async function getFeeStructures() {
  try {
    const feeStructures = await prisma.feeStructure.findMany({
      orderBy: [{ academicYear: "desc" }, { className: "asc" }, { dueDate: "asc" }],
    })
    return { success: true, feeStructures }
  } catch (error) {
    console.error("Error fetching fee structures:", error)
    return { success: false, feeStructures: [] }
  }
}

export async function createFeeStructure(data: {
  className: string
  feeType: string
  amount: number
  dueDate: string
  academicYear: string
}) {
  try {
    const amount = Number(data.amount)
    if (!data.className?.trim()) return { success: false, error: "Class likhein" }
    if (!data.feeType?.trim()) return { success: false, error: "Fee type chunein" }
    if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: "Amount 0 se zyada hona chahiye" }

    const dueDate = new Date(data.dueDate)
    if (isNaN(dueDate.getTime())) return { success: false, error: "Due date sahi nahi hai" }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        className: data.className.trim(),
        feeType: data.feeType.trim(),
        amount,
        dueDate,
        academicYear: data.academicYear.trim(),
      },
    })

    revalidatePath("/fees/setup")
    revalidateFees()
    return { success: true, feeStructure }
  } catch (error) {
    console.error("Error creating fee structure:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Fee structure save nahi ho saka",
    }
  }
}

export async function deleteFeeStructure(id: string) {
  try {
    const linkedItems = await prisma.paymentItem.count({ where: { feeStructureId: id } })

    // Payments are never deleted. Receipts keep their fee name and amount (stored on the item);
    // only the link to this fee structure is removed, and the money is then applied to the
    // remaining fee heads of the class by due date.
    await prisma.$transaction([
      prisma.paymentItem.updateMany({ where: { feeStructureId: id }, data: { feeStructureId: null } }),
      prisma.payment.updateMany({ where: { feeStructureId: id }, data: { feeStructureId: null } }),
      prisma.feeStructure.delete({ where: { id } }),
    ])

    revalidatePath("/fees/setup")
    revalidateFees()
    return { success: true, linkedItems }
  } catch (error) {
    console.error("Error deleting fee structure:", error)
    return { success: false, error: "Fee structure delete nahi ho saka" }
  }
}

// ---------- Dues, summary and ledger ----------

// Fees whose due date is still in the future are not "pending" yet.
function startOfTomorrow(): Date {
  const d = new Date()
  d.setHours(24, 0, 0, 0)
  return d
}

async function buildFeeSummary(academicYear: string) {
  const cutoff = startOfTomorrow()
  const [students, structures, payments] = await Promise.all([
    prisma.student.findMany({
      where: { isActive: true },
      select: {
        id: true, firstName: true, lastName: true, studentId: true, className: true, section: true,
        parentName: true, parentContact: true,
      },
    }),
    prisma.feeStructure.findMany({
      where: { academicYear },
      select: { className: true, amount: true, dueDate: true },
    }),
    // Voided payments never count as collected money.
    prisma.payment.findMany({
      where: { isVoided: false },
      select: { studentId: true, amountPaid: true },
    }),
  ])

  const dueByClass = new Map<string, number>()
  for (const fs of structures) {
    if (fs.dueDate >= cutoff) continue // not due yet
    dueByClass.set(fs.className, (dueByClass.get(fs.className) ?? 0) + fs.amount)
  }

  const paidByStudent = new Map<string, number>()
  let totalCollected = 0
  for (const p of payments) {
    paidByStudent.set(p.studentId, (paidByStudent.get(p.studentId) ?? 0) + p.amountPaid)
    totalCollected += p.amountPaid
  }

  const dues = students.map((student) => {
    const totalDue = dueByClass.get(student.className) ?? 0
    const totalPaid = paidByStudent.get(student.id) ?? 0
    return {
      student,
      totalDue,
      totalPaid,
      outstanding: Math.max(0, totalDue - totalPaid),
    }
  })

  const defaulters = dues
    .filter((d) => d.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)

  const totalPending = defaulters.reduce((sum, d) => sum + d.outstanding, 0)

  return { totalCollected, totalPending, defaulters, studentCount: students.length }
}

export async function getFeeSummary() {
  try {
    const settings = await loadSchoolSettings()
    const summary = await buildFeeSummary(settings.academicYear)
    return { success: true, academicYear: settings.academicYear, ...summary }
  } catch (error) {
    console.error("Error building fee summary:", error)
    return {
      success: false,
      academicYear: "",
      totalCollected: 0,
      totalPending: 0,
      defaulters: [] as Awaited<ReturnType<typeof buildFeeSummary>>["defaulters"],
      studentCount: 0,
    }
  }
}

export async function generateMonthlyFees(data: {
  className: string
  feeType: string
  amount: number
  academicYear: string
  startYear: number
  startMonth: number // 1-12
  months: number
  dueDay: number // 1-28
}) {
  try {
    const amount = Number(data.amount)
    if (!data.className?.trim()) return { success: false, error: "Class likhein" }
    if (!data.feeType?.trim()) return { success: false, error: "Fee type chunein" }
    if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: "Amount 0 se zyada hona chahiye" }
    if (!(data.months >= 1 && data.months <= 24)) return { success: false, error: "Months 1 se 24 ke beech hon" }
    if (!(data.dueDay >= 1 && data.dueDay <= 28)) return { success: false, error: "Due day 1 se 28 ke beech hon" }

    const className = data.className.trim()
    const feeType = data.feeType.trim()
    const dates: Date[] = []
    for (let i = 0; i < data.months; i++) {
      dates.push(new Date(Date.UTC(data.startYear, data.startMonth - 1 + i, data.dueDay)))
    }

    const existing = await prisma.feeStructure.findMany({
      where: {
        className,
        feeType,
        academicYear: data.academicYear.trim(),
        dueDate: { gte: dates[0], lte: dates[dates.length - 1] },
      },
      select: { dueDate: true },
    })
    const taken = new Set(existing.map((e) => e.dueDate.toISOString().slice(0, 10)))
    const toCreate = dates
      .filter((d) => !taken.has(d.toISOString().slice(0, 10)))
      .map((dueDate) => ({ className, feeType, amount, dueDate, academicYear: data.academicYear.trim() }))

    if (toCreate.length > 0) {
      await prisma.feeStructure.createMany({ data: toCreate })
    }

    revalidatePath("/fees/setup")
    revalidateFees()
    return { success: true, created: toCreate.length, skipped: dates.length - toCreate.length }
  } catch (error) {
    console.error("Error generating monthly fees:", error)
    return { success: false, error: "Monthly fees ban nahi sakin" }
  }
}

// Class-wise dues for the reports page (only fees already due).
export async function getClassDues() {
  try {
    const settings = await loadSchoolSettings()
    const cutoff = startOfTomorrow()
    const [students, structures, payments] = await Promise.all([
      prisma.student.findMany({ where: { isActive: true }, select: { id: true, className: true } }),
      prisma.feeStructure.findMany({ where: { academicYear: settings.academicYear }, select: { className: true, amount: true, dueDate: true } }),
      prisma.payment.findMany({ where: { isVoided: false }, select: { studentId: true, amountPaid: true } }),
    ])

    const dueByClass = new Map<string, number>()
    for (const fs of structures) {
      if (fs.dueDate >= cutoff) continue
      dueByClass.set(fs.className, (dueByClass.get(fs.className) ?? 0) + fs.amount)
    }
    const paidByStudent = new Map<string, number>()
    for (const p of payments) {
      paidByStudent.set(p.studentId, (paidByStudent.get(p.studentId) ?? 0) + p.amountPaid)
    }

    const classes = new Map<string, { className: string; students: number; due: number; paid: number; pending: number }>()
    for (const st of students) {
      const row = classes.get(st.className) ?? { className: st.className, students: 0, due: 0, paid: 0, pending: 0 }
      const due = dueByClass.get(st.className) ?? 0
      const paid = paidByStudent.get(st.id) ?? 0
      row.students += 1
      row.due += due
      row.paid += paid
      row.pending += Math.max(0, due - paid)
      classes.set(st.className, row)
    }

    return { success: true, rows: [...classes.values()].sort((a, b) => a.className.localeCompare(b.className)) }
  } catch (error) {
    console.error("Error building class dues:", error)
    return { success: false, rows: [] as Array<{ className: string; students: number; due: number; paid: number; pending: number }> }
  }
}

export async function getStudentFeeLedger(studentId: string) {
  try {
    const settings = await loadSchoolSettings()

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentId: true,
        className: true,
        section: true,
        rollNumber: true,
      },
    })
    if (!student) return { success: false as const, error: "Student nahi mila" }

    const [structures, payments] = await Promise.all([
      prisma.feeStructure.findMany({
        where: { className: student.className, academicYear: settings.academicYear },
        orderBy: { dueDate: "asc" },
      }),
      prisma.payment.findMany({
        where: { studentId },
        include: { items: true },
        orderBy: { paymentDate: "desc" },
      }),
    ])

    const activePayments = payments.filter((p) => !p.isVoided)
    const totalPaidAll = activePayments.reduce((sum, p) => sum + p.amountPaid, 0)

    // Money explicitly tied to a fee head (new itemised receipts, or old receipts linked to a head).
    const explicitPaid = new Map<string, number>()
    for (const p of activePayments) {
      if (p.items.length === 0) {
        if (p.feeStructureId) {
          explicitPaid.set(p.feeStructureId, (explicitPaid.get(p.feeStructureId) ?? 0) + p.amountPaid)
        }
        continue
      }
      for (const item of p.items) {
        if (item.feeStructureId) {
          explicitPaid.set(item.feeStructureId, (explicitPaid.get(item.feeStructureId) ?? 0) + item.amount)
        }
      }
    }

    // Money not tied to any head (older receipts): apply it to heads in due-date order.
    const explicitTotal = structures.reduce((sum, fs) => sum + (explicitPaid.get(fs.id) ?? 0), 0)
    let unallocated = Math.max(0, totalPaidAll - explicitTotal)

    const feeRows = structures.map((fs) => {
      const explicit = explicitPaid.get(fs.id) ?? 0
      const fromGeneral = Math.min(unallocated, Math.max(0, fs.amount - explicit))
      unallocated -= fromGeneral
      const paid = explicit + fromGeneral
      return {
        id: fs.id,
        feeType: fs.feeType,
        amount: fs.amount,
        dueDate: fs.dueDate,
        academicYear: fs.academicYear,
        paid,
        outstanding: Math.max(0, fs.amount - paid),
      }
    })

    const cutoff = startOfTomorrow()
    const totalDue = feeRows
      .filter((r) => new Date(r.dueDate) < cutoff)
      .reduce((sum, r) => sum + r.amount, 0)
    const totalPaid = activePayments.reduce((sum, p) => sum + p.amountPaid, 0)

    return {
      success: true as const,
      student,
      academicYear: settings.academicYear,
      feeRows,
      totalDue,
      totalPaid,
      outstanding: Math.max(0, totalDue - totalPaid),
      receipts: payments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        paymentDate: p.paymentDate,
        amountPaid: p.amountPaid,
        isVoided: p.isVoided,
        voidReason: p.voidReason,
        items: p.items.map((i) => ({ description: i.description, amount: i.amount })),
      })),
    }
  } catch (error) {
    console.error("Error loading fee ledger:", error)
    return { success: false as const, error: "Fee record load nahi ho saka" }
  }
}

// ---------- Payments (one receipt can cover several fee heads) ----------

export async function recordPayment(data: {
  studentId: string
  paymentDate: string
  items: Array<{ feeStructureId?: string; description?: string; amount: number }>
}) {
  try {
    if (!data.studentId) return { success: false, error: "Student chunein" }

    const paymentDate = new Date(data.paymentDate)
    if (isNaN(paymentDate.getTime())) return { success: false, error: "Payment date sahi nahi hai" }

    const lines = (data.items ?? [])
      .map((item) => ({
        feeStructureId: item.feeStructureId && item.feeStructureId.trim() !== "" ? item.feeStructureId : undefined,
        description: (item.description ?? "").trim(),
        amount: Number(item.amount),
      }))
      .filter((line) => Number.isFinite(line.amount) && line.amount > 0)

    if (lines.length === 0) {
      return { success: false, error: "Kam az kam ek fee head mein amount darj karein" }
    }

    // Look up fee structures on the server so the saved name/due date are trustworthy.
    const ids = lines.map((l) => l.feeStructureId).filter((id): id is string => Boolean(id))
    const structures = ids.length
      ? await prisma.feeStructure.findMany({ where: { id: { in: ids } } })
      : []
    const structureById = new Map(structures.map((s) => [s.id, s]))

    const itemsData: Array<{ feeStructureId?: string; description: string; amount: number; dueDate?: Date }> = []
    for (const line of lines) {
      if (line.feeStructureId) {
        const structure = structureById.get(line.feeStructureId)
        if (!structure) return { success: false, error: "Fee structure nahi mila" }
        itemsData.push({
          feeStructureId: structure.id,
          description: structure.feeType,
          amount: line.amount,
          dueDate: structure.dueDate,
        })
      } else {
        if (!line.description) return { success: false, error: "Custom fee ka naam likhein" }
        itemsData.push({ description: line.description, amount: line.amount })
      }
    }

    const total = itemsData.reduce((sum, i) => sum + i.amount, 0)

    // Find a free receipt number (safe even after deletions).
    const count = await prisma.payment.count()
    let receiptNumber = ""
    for (let attempt = 1; attempt <= 10; attempt++) {
      const candidate = generateReceiptNumber(paymentDate, count + attempt)
      const exists = await prisma.payment.findUnique({ where: { receiptNumber: candidate }, select: { id: true } })
      if (!exists) {
        receiptNumber = candidate
        break
      }
    }
    if (!receiptNumber) return { success: false, error: "Receipt number nahi ban saka, dobara koshish karein" }

    const payment = await prisma.payment.create({
      data: {
        studentId: data.studentId,
        amountPaid: total,
        paymentDate,
        receiptNumber,
        items: { create: itemsData as any },
      },
    })

    revalidateFees()
    return { success: true, payment, receiptNumber }
  } catch (error) {
    console.error("Error recording payment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment save nahi ho saki",
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
          items: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { paymentDate: "desc" },
      }),
      prisma.payment.count({ where }),
    ])

    const collected = payments.filter((p) => !p.isVoided).reduce((sum, p) => sum + p.amountPaid, 0)

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

export async function getPaymentByReceipt(receiptNumber: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { receiptNumber },
      include: {
        student: true,
        feeStructure: true,
        items: { orderBy: { description: "asc" } },
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

    revalidateFees()
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

    revalidateFees()
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

    revalidateFees()
    return { success: true, message: "Payment restored successfully" }
  } catch (error) {
    console.error("Error restoring payment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore payment",
    }
  }
}
