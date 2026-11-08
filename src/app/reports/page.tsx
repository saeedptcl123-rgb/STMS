import { getCollectionReport } from "@/actions/reports"
import { getClassDues, getFeeSummary } from "@/actions/fees"
import { loadSchoolSettings } from "@/lib/school"
import { formatDate } from "@/lib/utils"
import { PrintButton } from "@/components/reports/PrintButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"
export const revalidate = 0

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const from = params.from || firstOfMonth()
  const to = params.to || today()

  const [settings, collection, classDues, summary] = await Promise.all([
    loadSchoolSettings(),
    getCollectionReport(from, to),
    getClassDues(),
    getFeeSummary(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">Collection, class-wise dues aur defaulters</p>
        </div>
        <form method="get" className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="block text-gray-600">From</span>
            <input type="date" name="from" defaultValue={from} className="rounded-md border px-2 py-1" />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600">To</span>
            <input type="date" name="to" defaultValue={to} className="rounded-md border px-2 py-1" />
          </label>
          <Button type="submit">Show</Button>
          <PrintButton />
        </form>
      </div>

      <div className="hidden print:block text-center">
        <h2 className="text-2xl font-bold">{settings.schoolName}</h2>
        <p>Report: {formatDate(from)} se {formatDate(to)} tak</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection ({formatDate(from)} – {formatDate(to)})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-bold text-green-700">Rs. {collection.total.toLocaleString()}</p>

          {collection.byDay.length === 0 ? (
            <p className="text-gray-500">Is date range mein koi payment nahi hui</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">Din</th>
                  <th className="py-2 text-right">Receipts</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {collection.byDay.map((d) => (
                  <tr key={d.date} className="border-b">
                    <td className="py-2">{formatDate(d.date)}</td>
                    <td className="py-2 text-right">{d.count}</td>
                    <td className="py-2 text-right">Rs. {d.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {collection.payments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2">Receipt</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Student</th>
                    <th className="py-2">Class</th>
                    <th className="py-2">Heads</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {collection.payments.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 font-mono text-xs">{p.receiptNumber}</td>
                      <td className="py-2">{formatDate(p.paymentDate)}</td>
                      <td className="py-2">{p.studentName} <span className="text-gray-500">({p.studentId})</span></td>
                      <td className="py-2">{p.className}</td>
                      <td className="py-2">{p.heads}</td>
                      <td className="py-2 text-right">Rs. {p.amountPaid.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Class-wise Dues (abhi tak ki due fees)</CardTitle>
        </CardHeader>
        <CardContent>
          {classDues.rows.length === 0 ? (
            <p className="text-gray-500">Abhi koi class ya student nahi</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">Class</th>
                  <th className="py-2 text-right">Students</th>
                  <th className="py-2 text-right">Due</th>
                  <th className="py-2 text-right">Paid</th>
                  <th className="py-2 text-right">Pending</th>
                </tr>
              </thead>
              <tbody>
                {classDues.rows.map((r) => (
                  <tr key={r.className} className="border-b">
                    <td className="py-2">{r.className}</td>
                    <td className="py-2 text-right">{r.students}</td>
                    <td className="py-2 text-right">Rs. {r.due.toLocaleString()}</td>
                    <td className="py-2 text-right">Rs. {r.paid.toLocaleString()}</td>
                    <td className="py-2 text-right font-medium text-red-600">Rs. {r.pending.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Defaulters ({summary.defaulters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.defaulters.length === 0 ? (
            <p className="text-gray-500">Koi defaulter nahi</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">Student</th>
                  <th className="py-2">ID</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Parent</th>
                  <th className="py-2">Contact</th>
                  <th className="py-2 text-right">Pending</th>
                </tr>
              </thead>
              <tbody>
                {summary.defaulters.map((d) => (
                  <tr key={d.student.id} className="border-b">
                    <td className="py-2">{d.student.firstName} {d.student.lastName}</td>
                    <td className="py-2">{d.student.studentId}</td>
                    <td className="py-2">{d.student.className}-{d.student.section}</td>
                    <td className="py-2">{d.student.parentName}</td>
                    <td className="py-2">{d.student.parentContact}</td>
                    <td className="py-2 text-right font-medium text-red-600">Rs. {d.outstanding.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
