import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { loadSchoolSettings } from "@/lib/school"
import { getStudentFeeLedger } from "@/actions/fees"
import { FeeChalanView, type ChalanHead } from "./FeeChalanView"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface Props {
  params: Promise<{ receiptNumber: string }>
}

export default async function ChalanPage({ params }: Props) {
  const { receiptNumber } = await params

  const [payment, settings] = await Promise.all([
    prisma.payment.findUnique({
      where: { receiptNumber },
      include: { student: true, items: true },
    }),
    loadSchoolSettings(),
  ])

  if (!payment) {
    notFound()
  }

  // All fee heads of this student's class (with due dates), plus how much each head has paid so far.
  const ledger = await getStudentFeeLedger(payment.studentId)
  const rows = ledger.success && ledger.feeRows ? ledger.feeRows : []
  const rowIds = new Set(rows.map((r) => r.id))

  const heads: ChalanHead[] = rows.map((r) => ({
    description: r.feeType,
    dueDate: new Date(r.dueDate).toISOString(),
    amount: r.amount,
    paidNow: payment.items
      .filter((i) => i.feeStructureId === r.id)
      .reduce((sum, i) => sum + i.amount, 0),
    outstanding: r.outstanding,
  }))

  // Items in this receipt that are not one of the class heads (custom or from another year).
  for (const item of payment.items) {
    if (item.feeStructureId && rowIds.has(item.feeStructureId)) continue
    heads.push({
      description: item.description,
      dueDate: item.dueDate ? item.dueDate.toISOString() : null,
      amount: item.amount,
      paidNow: item.amount,
      outstanding: 0,
    })
  }

  // Older receipts without itemised heads.
  if (payment.items.length === 0) {
    heads.push({ description: "Fee", dueDate: null, amount: payment.amountPaid, paidNow: payment.amountPaid, outstanding: 0 })
  }

  return (
    <FeeChalanView
      payment={{
        receiptNumber: payment.receiptNumber,
        amountPaid: payment.amountPaid,
        paymentDate: payment.paymentDate.toISOString(),
        student: payment.student,
      }}
      heads={heads}
      balance={ledger.success ? (ledger.outstanding ?? 0) : 0}
      settings={{
        schoolName: settings.schoolName,
        shortName: settings.shortName,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        bankName: settings.bankName,
        bankBranch: settings.bankBranch,
        accountTitle: settings.accountTitle,
        accountNumber: settings.accountNumber,
        academicYear: settings.academicYear,
        logoData: settings.logoData,
      }}
    />
  )
}
