import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { FeeChalanView } from "./FeeChalanView"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface Props {
  params: Promise<{ receiptNumber: string }>
}

export default async function ChalanPage({ params }: Props) {
  const { receiptNumber } = await params

  const payment = await prisma.payment.findUnique({
    where: { receiptNumber },
    include: {
      student: true,
      feeStructure: true,
    },
  })

  if (!payment) {
    notFound()
  }

  const formattedPayment = {
    ...payment,
    paymentDate: payment.paymentDate.toISOString(),
    feeStructure: payment.feeStructure
      ? {
          ...payment.feeStructure,
          dueDate: payment.feeStructure.dueDate.toISOString(),
        }
      : null,
  }

  return <FeeChalanView payment={formattedPayment} />
}