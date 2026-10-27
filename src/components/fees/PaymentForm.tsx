"use client"

import { useState, useEffect } from "react"
import { getStudents } from "@/actions/student"
import { getFeeStructures, recordPayment } from "@/actions/fees"
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
  rollNumber: string
}

interface FeeStructure {
  id: string
  feeType: string
  amount: number
  className: string
}

export function PaymentForm() {
  const [students, setStudents] = useState<Student[]>([])
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<string>("")
  const [amountPaid, setAmountPaid] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleStudentChange = (value: string | null) => setSelectedStudent(value ?? "")
  const handleFeeStructureChange = (value: string | null) => setSelectedFeeStructure(value ?? "")

  // Get selected student object for display
  const selectedStudentObj = students.find((s) => s.id === selectedStudent)

  // Get selected fee structure object for display
  const selectedFeeStructureObj = feeStructures.find((f) => f.id === selectedFeeStructure)

  // Pre-fill amount when fee structure is selected, but keep editable
  useEffect(() => {
    if (selectedFeeStructureObj) {
      setAmountPaid(selectedFeeStructureObj.amount.toString())
    }
  }, [selectedFeeStructureObj])

  useEffect(() => {
    const fetchData = async () => {
      const [studentsResult, feesResult] = await Promise.all([
        getStudents({ limit: 100 }),
        getFeeStructures(),
      ])

      if (studentsResult.success) {
        setStudents(studentsResult.students)
      }
      if (feesResult.success) {
        setFeeStructures(feesResult.feeStructures)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await recordPayment({
      studentId: selectedStudent,
      feeStructureId: selectedFeeStructure,
      amountPaid: parseFloat(amountPaid),
      paymentDate,
    })

    if (result.success) {
      setMessage({ type: "success", text: `Payment recorded! Receipt: ${result.receiptNumber}` })
      setSelectedStudent("")
      setSelectedFeeStructure("")
      setAmountPaid("")
    } else {
      setMessage({ type: "error", text: result.error || "Failed to record payment" })
    }

    setLoading(false)
  }

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
                <SelectValue
                  placeholder="Select student"
                >
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

          <div className="space-y-2">
            <Label>Fee Type (Optional)</Label>
            <Select value={selectedFeeStructure} onValueChange={handleFeeStructureChange}>
              <SelectTrigger>
                <SelectValue
                  placeholder="Select fee type"
                >
                  {selectedFeeStructureObj
                    ? `${selectedFeeStructureObj.feeType} - Rs. ${selectedFeeStructureObj.amount} (Class ${selectedFeeStructureObj.className})`
                    : "Select fee type"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Custom Amount)</SelectItem>
                {feeStructures.map((fee) => (
                  <SelectItem key={fee.id} value={fee.id}>
                    {fee.feeType} - Rs. {fee.amount} (Class {fee.className})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (Rs.)</Label>
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading || !selectedStudent} className="w-full">
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
