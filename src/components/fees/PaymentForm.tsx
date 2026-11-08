"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getStudents } from "@/actions/student"
import { getStudentFeeLedger, getFeeTypes, recordPayment } from "@/actions/fees"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Student {
  id: string
  firstName: string
  lastName: string
  studentId: string
}

interface LedgerRow {
  id: string
  feeType: string
  amount: number
  dueDate: string | Date
  paid: number
  outstanding: number
}

interface PaymentLine {
  key: string // fee structure id, or "type:<name>" for a fee type without a class structure
  feeStructureId?: string
  feeType: string
  dueDate?: string | Date | null
  amount: number
}

const TYPE_PREFIX = "type:"

export function PaymentForm({ initialStudentId }: { initialStudentId?: string }) {
  const [students, setStudents] = useState<Student[]>([])
  const [feeTypeNames, setFeeTypeNames] = useState<string[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [rows, setRows] = useState<LedgerRow[]>([])
  const [loadingLedger, setLoadingLedger] = useState(false)

  // Building the payment: pick a fee type, enter amount, Add. Repeat. Then Save.
  const [chosenKey, setChosenKey] = useState("")
  const [chosenAmount, setChosenAmount] = useState("")
  const [lines, setLines] = useState<PaymentLine[]>([])

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const selectedStudentObj = students.find((s) => s.id === selectedStudent)

  // Fee types that have a class structure use those rows; the rest are offered as plain fee types.
  const structureNames = new Set(rows.map((r) => r.feeType))
  const typeOnly = feeTypeNames.filter((name) => !structureNames.has(name))
  const chosenRow = rows.find((r) => r.id === chosenKey)
  const chosenTypeName = chosenKey.startsWith(TYPE_PREFIX) ? chosenKey.slice(TYPE_PREFIX.length) : ""

  const total = lines.reduce((sum, l) => sum + l.amount, 0)

  useEffect(() => {
    getStudents({ limit: 500 }).then((result) => {
      if (result.success) setStudents(result.students)
    })
    getFeeTypes().then((result) => {
      if (result.success) setFeeTypeNames(result.feeTypes.map((t) => t.name))
    })
  }, [])

  const loadLedger = async (studentId: string) => {
    setLoadingLedger(true)
    const result = await getStudentFeeLedger(studentId)
    if (result.success && result.feeRows) {
      setRows(result.feeRows)
    } else {
      setRows([])
      setMessage({ type: "error", text: result.error || "Fee record load nahi ho saka" })
    }
    setChosenKey("")
    setChosenAmount("")
    setLoadingLedger(false)
  }

  const handleStudentChange = (value: string | null) => {
    const id = value ?? ""
    setSelectedStudent(id)
    setLines([])
    setMessage(null)
    if (id) loadLedger(id)
    else setRows([])
  }

  // Opened from the defaulters list ("Pay now"): preselect that student.
  useEffect(() => {
    if (initialStudentId) handleStudentChange(initialStudentId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStudentId])

  const chooseFeeType = (value: string | null) => {
    const key = value ?? ""
    setChosenKey(key)
    const row = rows.find((r) => r.id === key)
    setChosenAmount(row && row.outstanding > 0 ? String(row.outstanding) : "")
  }

  // Add the chosen fee type with the typed amount. Same fee type again = amount updated.
  const addLine = () => {
    const amount = parseFloat(chosenAmount)
    if (!chosenRow && !chosenTypeName) {
      setMessage({ type: "error", text: "Pehle fee type chunein" })
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Amount 0 se zyada likhein" })
      return
    }
    setMessage(null)
    const line: PaymentLine = chosenRow
      ? { key: chosenRow.id, feeStructureId: chosenRow.id, feeType: chosenRow.feeType, dueDate: chosenRow.dueDate, amount }
      : { key: chosenKey, feeType: chosenTypeName, dueDate: null, amount }
    setLines((prev) => [...prev.filter((l) => l.key !== line.key), line])
    setChosenKey("")
    setChosenAmount("")
  }

  const addAllBalances = () => {
    setMessage(null)
    setLines(
      rows
        .filter((r) => r.outstanding > 0)
        .map((r) => ({ key: r.id, feeStructureId: r.id, feeType: r.feeType, dueDate: r.dueDate, amount: r.outstanding }))
    )
  }

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0) {
      setMessage({ type: "error", text: "Pehle kam az kam ek fee type add karein" })
      return
    }
    setLoading(true)
    setMessage(null)

    const result = await recordPayment({
      studentId: selectedStudent,
      paymentDate,
      items: lines.map((l) => ({
        feeStructureId: l.feeStructureId,
        description: l.feeType,
        amount: l.amount,
      })),
    })

    if (result.success) {
      setMessage({ type: "success", text: `Payment saved! Receipt: ${result.receiptNumber}` })
      await loadLedger(selectedStudent)
      setLines([])
    } else {
      setMessage({ type: "error", text: result.error || "Payment save nahi ho saki" })
    }

    setLoading(false)
  }

  const structureLabel = (r: LedgerRow) =>
    `${r.feeType} · Total Rs. ${r.amount.toLocaleString()} · Baqi Rs. ${r.outstanding.toLocaleString()} · Due ${formatDate(r.dueDate)}`

  const selectedLabel = chosenRow
    ? structureLabel(chosenRow)
    : chosenTypeName
      ? `${chosenTypeName} (amount khud likhein)`
      : "Fee type chunein"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-4 ${message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Student</Label>
            <Select value={selectedStudent} onValueChange={handleStudentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select student">
                  {selectedStudentObj
                    ? `${selectedStudentObj.firstName} ${selectedStudentObj.lastName} (${selectedStudentObj.studentId})`
                    : "Select student"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.studentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && loadingLedger && (
            <p className="text-sm text-gray-500">Fee record load ho raha hai...</p>
          )}

          {selectedStudent && !loadingLedger && rows.length === 0 && typeOnly.length === 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800">
                Koi fee type nahi mili.{" "}
                <Link href="/fees/setup" className="underline font-medium">Fee Setup</Link> mein fee types banayein.
              </AlertDescription>
            </Alert>
          )}

          {selectedStudent && (rows.length > 0 || typeOnly.length > 0) && (
            <div className="rounded-md border p-3 space-y-3">
              <Label>1. Fee Type chunein</Label>
              <Select value={chosenKey} onValueChange={chooseFeeType}>
                <SelectTrigger className="h-auto min-h-9 py-2">
                  <SelectValue placeholder="Fee type chunein">{selectedLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {rows.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {structureLabel(r)}
                      {r.outstanding <= 0 ? " (ada ho chuki)" : ""}
                    </SelectItem>
                  ))}
                  {typeOnly.map((name) => (
                    <SelectItem key={`${TYPE_PREFIX}${name}`} value={`${TYPE_PREFIX}${name}`}>
                      {name} (is class ke liye amount khud likhein)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>2. Amount (Rs.)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount likhein"
                  value={chosenAmount}
                  onChange={(e) => setChosenAmount(e.target.value)}
                  disabled={!chosenRow && !chosenTypeName}
                />
                <Button type="button" onClick={addLine} disabled={!chosenRow && !chosenTypeName}>
                  3. Add
                </Button>
              </div>

              {rows.length > 0 && (
                <Button type="button" variant="outline" className="w-full" onClick={addAllBalances}>
                  Sab fee types ka baqi amount ek saath add karein
                </Button>
              )}
            </div>
          )}

          {lines.length > 0 && (
            <div className="rounded-md border divide-y">
              {lines.map((l) => (
                <div key={l.key} className="flex items-center justify-between gap-2 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{l.feeType}</p>
                    <p className="text-xs text-gray-500">
                      {l.dueDate ? `Due: ${formatDate(l.dueDate)}` : "Custom amount"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold">Rs. {l.amount.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => removeLine(l.key)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={`Remove ${l.feeType}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 font-semibold">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setLines([])}
                disabled={lines.length === 0}
              >
                Sab lines clear karein
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={loading || lines.length === 0} className="w-full">
            {loading ? "Saving..." : `4. Save Payment (Rs. ${total.toLocaleString()})`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
