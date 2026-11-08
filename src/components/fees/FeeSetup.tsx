"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createFeeType, deleteFeeType, createFeeStructure, deleteFeeStructure, generateMonthlyFees } from "@/actions/fees"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Notice = { type: "success" | "error"; text: string } | null

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null
  return (
    <Alert className={notice.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
      <AlertDescription className={notice.type === "success" ? "text-green-800" : "text-red-800"}>
        {notice.text}
      </AlertDescription>
    </Alert>
  )
}

export function FeeTypeManager({ feeTypes }: { feeTypes: Array<{ id: string; name: string }> }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [notice, setNotice] = useState<Notice>(null)
  const [pending, startTransition] = useTransition()

  const add = () => {
    startTransition(async () => {
      const result = await createFeeType(name)
      if (result.success) {
        setName("")
        setNotice({ type: "success", text: "Fee type add ho gayi" })
        router.refresh()
      } else {
        setNotice({ type: "error", text: result.error || "Fee type add nahi ho saki" })
      }
    })
  }

  const remove = (id: string) => {
    startTransition(async () => {
      const result = await deleteFeeType(id)
      setNotice(
        result.success
          ? { type: "success", text: "Fee type delete ho gayi" }
          : { type: "error", text: result.error || "Delete nahi ho saka" }
      )
      if (result.success) router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NoticeBox notice={notice} />
        <div className="flex gap-2">
          <Input
            placeholder="Naye fee type ka naam (jaise Exam Fee)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={add} disabled={pending || !name.trim()}>Add</Button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {feeTypes.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm">
              {t.name}
              <button
                type="button"
                onClick={() => remove(t.id)}
                disabled={pending}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Delete ${t.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function FeeStructureForm({
  feeTypes,
  classes,
  academicYear,
}: {
  feeTypes: Array<{ id: string; name: string }>
  classes: string[]
  academicYear: string
}) {
  const router = useRouter()
  const [className, setClassName] = useState("")
  const [feeType, setFeeType] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [year, setYear] = useState(academicYear)
  const [notice, setNotice] = useState<Notice>(null)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await createFeeStructure({
        className,
        feeType,
        amount: parseFloat(amount),
        dueDate,
        academicYear: year,
      })
      if (result.success) {
        setAmount("")
        setDueDate("")
        setNotice({ type: "success", text: `${feeType} for Class ${className} save ho gaya` })
        router.refresh()
      } else {
        setNotice({ type: "error", text: result.error || "Save nahi ho saka" })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Define Fee Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <NoticeBox notice={notice} />
        <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Class</Label>
            <Input
              list="class-options"
              placeholder="Class likhein ya chunein"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
            <datalist id="class-options">
              {classes.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label>Fee Type</Label>
            <Select value={feeType} onValueChange={(v) => setFeeType(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Fee type chunein">{feeType || "Fee type chunein"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {feeTypes.map((t) => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount (Rs.)</Label>
            <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Academic Year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} required />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={pending || !feeType || !className.trim()} className="w-full">
              {pending ? "Saving..." : "Save Fee Structure"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function FeeStructureList({
  structures,
}: {
  structures: Array<{ id: string; className: string; feeType: string; amount: number; dueDate: string | Date; academicYear: string }>
}) {
  const router = useRouter()
  const [notice, setNotice] = useState<Notice>(null)
  const [pending, startTransition] = useTransition()

  const remove = (id: string) => {
    const ok = window.confirm(
      "Ye fee structure delete hoga. Agar is par payments hui hain to unka record receipts mein safe rahega. Pakka delete karein?"
    )
    if (!ok) return
    startTransition(async () => {
      const result = await deleteFeeStructure(id)
      if (result.success) {
        const note = result.linkedItems
          ? ` ${result.linkedItems} payment entries ka record safe hai.`
          : ""
        setNotice({ type: "success", text: `Fee structure delete ho gaya.${note}` })
        router.refresh()
      } else {
        setNotice({ type: "error", text: result.error || "Delete nahi ho saka" })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Defined Fee Structures</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NoticeBox notice={notice} />
        {structures.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Abhi koi fee structure nahi bana</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 pr-3">Class</th>
                  <th className="py-2 pr-3">Fee Type</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Due Date</th>
                  <th className="py-2 pr-3">Year</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {structures.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-2 pr-3">{s.className}</td>
                    <td className="py-2 pr-3 font-medium">{s.feeType}</td>
                    <td className="py-2 pr-3">Rs. {s.amount.toLocaleString()}</td>
                    <td className="py-2 pr-3">{formatDate(s.dueDate)}</td>
                    <td className="py-2 pr-3">{s.academicYear}</td>
                    <td className="py-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => remove(s.id)} disabled={pending}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MonthlyFeeGenerator({
  feeTypes,
  classes,
  academicYear,
}: {
  feeTypes: Array<{ id: string; name: string }>
  classes: string[]
  academicYear: string
}) {
  const router = useRouter()
  const [className, setClassName] = useState("")
  const [feeType, setFeeType] = useState("Monthly Fee")
  const [amount, setAmount] = useState("")
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7))
  const [months, setMonths] = useState("12")
  const [dueDay, setDueDay] = useState("10")
  const [year, setYear] = useState(academicYear)
  const [notice, setNotice] = useState<Notice>(null)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const [y, m] = startMonth.split("-").map(Number)
    startTransition(async () => {
      const result = await generateMonthlyFees({
        className,
        feeType,
        amount: parseFloat(amount),
        academicYear: year,
        startYear: y,
        startMonth: m,
        months: parseInt(months, 10),
        dueDay: parseInt(dueDay, 10),
      })
      if (result.success) {
        setNotice({
          type: "success",
          text: `${result.created} mahine ki fee bani${result.skipped ? `, ${result.skipped} pehle se maujood thi` : ""}.`,
        })
        router.refresh()
      } else {
        setNotice({ type: "error", text: result.error || "Save nahi ho saka" })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Fee ek saath (12 mahine)</CardTitle>
      </CardHeader>
      <CardContent>
        <NoticeBox notice={notice} />
        <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Class</Label>
            <Input list="monthly-class-options" value={className} onChange={(e) => setClassName(e.target.value)} required />
            <datalist id="monthly-class-options">
              {classes.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label>Fee Type</Label>
            <Select value={feeType} onValueChange={(v) => setFeeType(v ?? "")}>
              <SelectTrigger>
                <SelectValue>{feeType}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {feeTypes.map((t) => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount har mahine (Rs.)</Label>
            <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Pehla mahine</Label>
            <Input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Kitne mahine</Label>
            <Input type="number" min="1" max="24" value={months} onChange={(e) => setMonths(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Har mahine ki due date (din)</Label>
            <Input type="number" min="1" max="28" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Academic Year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} required />
          </div>
          <div className="md:col-span-1 flex items-end">
            <Button type="submit" disabled={pending || !className.trim() || !amount} className="w-full">
              {pending ? "Bana rahe hain..." : "Mahine ki fee banayein"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
