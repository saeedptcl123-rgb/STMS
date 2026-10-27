"use client"

import { useState, useEffect } from "react"
import { getPayments, voidPayment, deletePayment, restorePayment } from "@/actions/fees"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"

interface Payment {
  id: string
  receiptNumber: string
  amountPaid: number
  paymentDate: Date | string
  isVoided: boolean
  voidedAt: Date | string | null
  voidReason: string | null
  student: {
    id: string
    firstName: string
    lastName: string
    studentId: string
    className: string
    section: string
  }
  feeStructure: {
    id: string
    feeType: string
  } | null
}

export function ReceiptsTable() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showVoided, setShowVoided] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionMode, setActionMode] = useState<"void" | "delete" | "restore">("void")
  const [paymentToAction, setPaymentToAction] = useState<Payment | null>(null)
  const [voidReason, setVoidReason] = useState("")

  const fetchPayments = async () => {
    setLoading(true)
    const result = await getPayments({ page, limit: 15, search })
    if (result.success) {
      let filteredPayments = result.payments as Payment[]
      if (!showVoided) {
        filteredPayments = filteredPayments.filter(p => !p.isVoided)
      }
      setPayments(filteredPayments)
      setTotalPages(result.totalPages)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [page, search, showVoided])

  const handleAction = async () => {
    if (!paymentToAction) return

    let result
    if (actionMode === "void") {
      result = await voidPayment(paymentToAction.receiptNumber, voidReason)
    } else if (actionMode === "delete") {
      result = await deletePayment(paymentToAction.receiptNumber)
    } else if (actionMode === "restore") {
      result = await restorePayment(paymentToAction.receiptNumber)
    }

    if (result?.success) {
      setActionDialogOpen(false)
      setPaymentToAction(null)
      setActionMode("void")
      setVoidReason("")
      fetchPayments()
    } else {
      alert(result?.error || "Action failed")
    }
  }

  const openActionDialog = (payment: Payment, mode: "void" | "delete" | "restore") => {
    setPaymentToAction(payment)
    setActionMode(mode)
    setActionDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Input
          placeholder="Search receipts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showVoided}
              onChange={(e) => setShowVoided(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show Voided
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className={payment.isVoided ? "bg-gray-50" : ""}>
                  <TableCell className="font-mono text-sm">{payment.receiptNumber}</TableCell>
                  <TableCell className="font-medium">
                    {payment.student.firstName} {payment.student.lastName}
                    <br />
                    <span className="text-xs text-gray-500">{payment.student.studentId}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Class {payment.student.className}-{payment.student.section}</Badge>
                  </TableCell>
                  <TableCell>{payment.feeStructure?.feeType ?? "N/A"}</TableCell>
                  <TableCell className="font-medium">
                    Rs.{payment.amountPaid.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>
                    {payment.isVoided ? (
                      <Badge variant="destructive" className="gap-1">
                        Voided
                        {payment.voidedAt && (
                          <span className="text-xs">
                            {" "}
                            {formatDate(payment.voidedAt)}
                          </span>
                        )}
                      </Badge>
                    ) : (
                      <Badge variant="default">Valid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/fees/chalan/${payment.receiptNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm" className="gap-1">
                          <FileText className="h-4 w-4" />
                          Chalan
                        </Button>
                      </Link>
                      {!payment.isVoided ? (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openActionDialog(payment, "void")}
                          >
                            Void
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog(payment, "delete")}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(payment, "restore")}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="py-2 px-4 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionMode === "void" ? "Void Payment Receipt" : actionMode === "delete" ? "Permanently Delete Payment" : "Restore Payment"}
            </DialogTitle>
            <DialogDescription>
              {actionMode === "void"
                ? `This will mark receipt ${paymentToAction?.receiptNumber} as VOIDED. The record will be preserved for audit trail but excluded from financial reports and active lists.`
                : actionMode === "delete"
                ? `This will PERMANENTLY delete receipt ${paymentToAction?.receiptNumber}. This action CANNOT be undone and will remove the record from the database entirely.`
                : `This will restore receipt ${paymentToAction?.receiptNumber} to active status. It will reappear in reports and active lists.`}
            </DialogDescription>
          </DialogHeader>
          {actionMode === "void" && (
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Void Reason (required)</label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter reason for voiding this payment..."
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialogOpen(false); setVoidReason(""); }}>
              Cancel
            </Button>
            <Button
              variant={actionMode === "delete" ? "destructive" : actionMode === "void" ? "destructive" : "default"}
              onClick={handleAction}
              className={actionMode === "delete" ? "bg-red-700 hover:bg-red-800" : ""}
            >
              {actionMode === "void" ? "Void Receipt" : actionMode === "delete" ? "Delete Permanently" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}