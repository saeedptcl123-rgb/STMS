import { prisma } from "@/lib/db"
import { PaymentForm } from "@/components/fees/PaymentForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Receipt, ArrowLeft } from "lucide-react"

async function getFeeStats() {
  const [totalCollected, totalStudents, feeStructures] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amountPaid: true },
    }),
    prisma.student.count({ where: { isActive: true } }),
    prisma.feeStructure.findMany(),
  ])

  return {
    totalCollected: totalCollected._sum.amountPaid || 0,
    totalStudents,
    feeStructureCount: feeStructures.length,
  }
}

export default async function FeesPage() {
  const stats = await getFeeStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="mt-2 text-gray-600">
            Manage fee structures and record student payments
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Collected"
          value={`Rs.${stats.totalCollected.toLocaleString()}`}
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon="👨‍🎓"
          color="primary"
        />
        <StatsCard
          title="Fee Structures"
          value={stats.feeStructureCount}
          icon="📋"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/fees/receipts">
            <Button className="w-full justify-start gap-3 p-4 hover:bg-gray-50" variant="outline">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Print Fee Chalan (3 Copies)</p>
                <p className="text-sm text-gray-500">Generate School, Bank & Student copies for any receipt</p>
              </div>
            </Button>
          </Link>
          <Link href="/fees/receipts">
            <Button className="w-full justify-start gap-3 p-4 hover:bg-gray-50" variant="outline">
              <div className="p-2 bg-green-100 rounded-lg">
                <Receipt className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">View All Payment Receipts</p>
                <p className="text-sm text-gray-500">Browse transaction history with chalan links</p>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <PaymentForm />

        {/* Fee Structures */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Structures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-4">
              Fee structures will be displayed here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}