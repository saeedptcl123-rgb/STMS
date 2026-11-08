import { PaymentForm } from "@/components/fees/PaymentForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Receipt, Settings2, AlertTriangle } from "lucide-react"
import { getFeeSummary } from "@/actions/fees"
import { loadSchoolSettings } from "@/lib/school"
import { toWhatsAppNumber } from "@/lib/phone"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Defaulter = {
  student: { parentName: string; parentContact: string; firstName: string; lastName: string }
  outstanding: number
}

function reminderHref(d: Defaulter, schoolName: string): string | null {
  const number = toWhatsAppNumber(d.student.parentContact)
  if (!number) return null
  const text = encodeURIComponent(
    `Assalam o Alaikum ${d.student.parentName}. ${d.student.firstName} ${d.student.lastName} ki fee Rs. ${d.outstanding.toLocaleString()} baqi hai. Meherbani karke jald ada karein. - ${schoolName}`
  )
  return `https://wa.me/${number}?text=${text}`
}

export default async function FeesPage({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  const { student } = await searchParams
  const summary = await getFeeSummary()
  const settings = await loadSchoolSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
        <p className="mt-2 text-gray-600">
          Academic year {summary.academicYear}: record payments and track dues
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Collected"
          value={`Rs. ${summary.totalCollected.toLocaleString()}`}
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Total Pending"
          value={`Rs. ${summary.totalPending.toLocaleString()}`}
          icon="⏳"
          color="purple"
        />
        <StatsCard
          title="Defaulters"
          value={summary.defaulters.length}
          icon="⚠️"
          color="primary"
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
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/fees/setup">
            <Button className="w-full justify-start gap-3 p-4 hover:bg-gray-50 h-auto" variant="outline">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings2 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Fee Setup</p>
                <p className="text-sm text-gray-500">Fee types aur class-wise amounts</p>
              </div>
            </Button>
          </Link>
          <Link href="/fees/receipts">
            <Button className="w-full justify-start gap-3 p-4 hover:bg-gray-50 h-auto" variant="outline">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Receipts &amp; Chalan</p>
                <p className="text-sm text-gray-500">Saare receipts dekhein aur print karein</p>
              </div>
            </Button>
          </Link>
          <Link href="/fees/receipts">
            <Button className="w-full justify-start gap-3 p-4 hover:bg-gray-50 h-auto" variant="outline">
              <div className="p-2 bg-green-100 rounded-lg">
                <Receipt className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Payment History</p>
                <p className="text-sm text-gray-500">Transaction history aur voids</p>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="record-payment">
          <PaymentForm initialStudentId={student} />
        </div>

        {/* Defaulters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Pending Dues (Defaulters)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.defaulters.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Koi pending due nahi hai</p>
            ) : (
              <ul className="divide-y max-h-[32rem] overflow-y-auto">
                {summary.defaulters.slice(0, 50).map((d) => (
                  <li key={d.student.id} className="flex items-center justify-between py-3">
                    <Link href={`/students/${d.student.id}`} className="min-w-0 hover:underline">
                      <p className="font-medium text-gray-900 truncate">
                        {d.student.firstName} {d.student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {d.student.studentId} · Class {d.student.className}-{d.student.section}
                      </p>
                    </Link>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-semibold text-red-600">Rs. {d.outstanding.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">of Rs. {d.totalDue.toLocaleString()}</p>
                      <div className="mt-2 flex justify-end gap-2">
                        <Link
                          href={`/fees?student=${d.student.id}#record-payment`}
                          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                        >
                          Pay now
                        </Link>
                        {reminderHref(d, settings.schoolName) && (
                          <a
                            href={reminderHref(d, settings.schoolName) as string}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-green-600 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
