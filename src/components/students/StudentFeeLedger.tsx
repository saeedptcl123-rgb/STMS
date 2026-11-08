import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { getStudentFeeLedger } from "@/actions/fees"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function StudentFeeLedger({ studentId }: { studentId: string }) {
  const ledger = await getStudentFeeLedger(studentId)

  if (!ledger.success || !ledger.feeRows) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fee Record</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">{ledger.error || "Fee record available nahi"}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Fee Record · Academic Year {ledger.academicYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Total Fee</p>
              <p className="font-semibold">Rs. {ledger.totalDue.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs text-gray-500">Paid</p>
              <p className="font-semibold text-green-700">Rs. {ledger.totalPaid.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="font-semibold text-red-600">Rs. {ledger.outstanding.toLocaleString()}</p>
            </div>
          </div>

          {ledger.feeRows.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Is class ke liye is saal ki koi fee structure nahi bana
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2 pr-3">Fee Head</th>
                    <th className="py-2 pr-3">Due Date</th>
                    <th className="py-2 pr-3 text-right">Amount</th>
                    <th className="py-2 pr-3 text-right">Paid</th>
                    <th className="py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.feeRows.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2 pr-3 font-medium">{row.feeType}</td>
                      <td className="py-2 pr-3">{formatDate(row.dueDate)}</td>
                      <td className="py-2 pr-3 text-right">Rs. {row.amount.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-right">Rs. {row.paid.toLocaleString()}</td>
                      <td className="py-2 text-right">
                        {row.outstanding > 0 ? (
                          <span className="text-red-600 font-medium">Rs. {row.outstanding.toLocaleString()}</span>
                        ) : (
                          <Badge variant="secondary">Paid</Badge>
                        )}
                      </td>
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
          <CardTitle className="text-lg">Payment Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          {ledger.receipts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Abhi tak koi payment nahi hui</p>
          ) : (
            <ul className="divide-y">
              {ledger.receipts.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link href={`/fees/chalan/${r.receiptNumber}`} className="font-mono text-sm font-medium hover:underline">
                      {r.receiptNumber}
                    </Link>
                    <p className="text-xs text-gray-500">{formatDate(r.paymentDate)}</p>
                    {r.items.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {r.items.map((i) => `${i.description} Rs. ${i.amount.toLocaleString()}`).join(" · ")}
                      </p>
                    )}
                    {r.isVoided && (
                      <p className="text-xs text-red-600 mt-1">Voided: {r.voidReason || "—"}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-semibold ${r.isVoided ? "line-through text-gray-400" : ""}`}>
                      Rs. {r.amountPaid.toLocaleString()}
                    </p>
                    {r.isVoided && <Badge variant="destructive">Voided</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
