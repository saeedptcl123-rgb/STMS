"use client"

import { useState, useEffect } from "react"
import { getAttendance, markAttendance } from "@/actions/attendance"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

interface AttendanceRecord {
  student: {
    id: string
    firstName: string
    lastName: string
    rollNumber: string
  }
  status: "present" | "absent" | "leave" | null
}

export function AttendanceGrid() {
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    percentage: 0,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchAttendance = async () => {
    if (!selectedClass || !selectedDate) return

    setLoading(true)
    const result = await getAttendance({
      className: selectedClass,
      date: selectedDate,
    })

    if (result.success) {
      setRecords(result.records as AttendanceRecord[])
      setSummary(result.summary)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAttendance()
  }, [selectedClass, selectedDate])

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "leave") => {
    setRecords((prev) =>
      prev.map((record) =>
        record.student.id === studentId ? { ...record, status } : record
      )
    )
  }

  const handleSave = async () => {
    if (!selectedClass || !selectedDate) return

    setSaving(true)
    setMessage(null)

    const attendanceRecords = records
      .filter((r) => r.status !== null)
      .map((r) => ({
        studentId: r.student.id,
        status: r.status as "present" | "absent" | "leave",
      }))

    const result = await markAttendance({
      className: selectedClass,
      date: selectedDate,
      records: attendanceRecords,
    })

    if (result.success) {
      setMessage({ type: "success", text: `Attendance marked for ${result.marked} students` })
      fetchAttendance()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to mark attendance" })
    }

    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Label>Select Class</Label>
          <Select value={selectedClass} onValueChange={(value) => setSelectedClass(value ?? "")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  Class {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Date</Label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleSave} disabled={saving || records.length === 0}>
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      {selectedClass && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-sm text-gray-600">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{summary.present}</div>
              <p className="text-sm text-gray-600">Present</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
              <p className="text-sm text-gray-600">Absent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{summary.leave}</div>
              <p className="text-sm text-gray-600">Leave</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{summary.percentage}%</div>
              <p className="text-sm text-gray-600">Attendance</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance for Class {selectedClass} - {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found in this class
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.student.id}>
                      <TableCell className="font-mono">{record.student.rollNumber}</TableCell>
                      <TableCell className="font-medium">
                        {record.student.firstName} {record.student.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={record.status === "present" ? "default" : "outline"}
                            onClick={() => handleStatusChange(record.student.id, "present")}
                            className={record.status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={record.status === "absent" ? "default" : "outline"}
                            onClick={() => handleStatusChange(record.student.id, "absent")}
                            className={record.status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
                          >
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={record.status === "leave" ? "default" : "outline"}
                            onClick={() => handleStatusChange(record.student.id, "leave")}
                            className={record.status === "leave" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                          >
                            Leave
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
