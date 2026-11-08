"use server"

import { prisma } from "@/lib/db"

// Payments (non-voided) between two dates, inclusive. Dates are "YYYY-MM-DD".
export async function getCollectionReport(fromStr: string, toStr: string) {
  try {
    const from = new Date(`${fromStr}T00:00:00`)
    const to = new Date(`${toStr}T00:00:00`)
    to.setDate(to.getDate() + 1)

    const payments = await prisma.payment.findMany({
      where: { isVoided: false, paymentDate: { gte: from, lt: to } },
      include: {
        student: { select: { firstName: true, lastName: true, className: true, section: true, studentId: true } },
        items: true,
      },
      orderBy: { paymentDate: "asc" },
    })

    const byDay = new Map<string, { date: string; amount: number; count: number }>()
    for (const p of payments) {
      const key = p.paymentDate.toISOString().slice(0, 10)
      const row = byDay.get(key) ?? { date: key, amount: 0, count: 0 }
      row.amount += p.amountPaid
      row.count += 1
      byDay.set(key, row)
    }

    return {
      success: true,
      total: payments.reduce((sum, p) => sum + p.amountPaid, 0),
      byDay: [...byDay.values()],
      payments: payments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        paymentDate: p.paymentDate.toISOString(),
        amountPaid: p.amountPaid,
        studentName: `${p.student.firstName} ${p.student.lastName}`,
        studentId: p.student.studentId,
        className: `${p.student.className}-${p.student.section}`,
        heads: p.items.map((i) => i.description).join(", ") || "Fee",
      })),
    }
  } catch (error) {
    console.error("Error building collection report:", error)
    return { success: false, total: 0, byDay: [], payments: [] }
  }
}
