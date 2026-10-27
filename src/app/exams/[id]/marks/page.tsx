"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getExam, getStudentsByClass, enterMarks } from "@/actions/exams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface Subject {
  name: string
  maxMarks: number
}

interface Student {
  id: string
  firstName: string
  lastName: string
  rollNumber: string
  studentId: string
}

interface MarksRecord {
  studentId: string
  marks: Record<string, number>
}

export default function EnterMarksPage() {
  const params = useParams()
  const examId = params.id as string

  const [exam, setExam] = useState<{
    id: string
    name: string
    className: string
    subjects: Subject[]
    examDate: string
  } | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [marksData, setMarksData] = useState<Record<string, MarksRecord>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const [examResult, studentsResult] = await Promise.all([
        getExam(examId),
        getStudentsByClass ? getStudentsByClass({ className: "" }) : Promise.resolve({ success: true, students: [] }),
      ])

      if (examResult.success && examResult.exam) {
        const subjects = JSON.parse(examResult.exam.subjects) as string[]
        const maxMarks = JSON.parse(examResult.exam.maxMarks) as Record<string, number>
        const subjectList: Subject[] = subjects.map((s) => ({
          name: s,
          maxMarks: maxMarks[s] || 100,
        }))

        setExam({
          id: examResult.exam.id,
          name: examResult.exam.name,
          className: examResult.exam.className,
          subjects: subjectList,
          examDate: formatDate(examResult.exam.examDate),
        })

        const studentsResult2 = await getStudentsByClass?.({ className: examResult.exam.className })
        if (studentsResult2?.success) {
          setStudents(studentsResult2.students)
          const initialMarks: Record<string, MarksRecord> = {}
          studentsResult2.students.forEach((student: Student) => {
            initialMarks[student.id] = {
              studentId: student.id,
              marks: {},
            }
            subjectList.forEach((subject) => {
              initialMarks[student.id].marks[subject.name] = 0
            })
          })
          setMarksData(initialMarks)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [examId])

  const handleMarksChange = (studentId: string, subject: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0)
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: {
          ...prev[studentId].marks,
          [subject]: numValue,
        },
      },
    }))
  }

  const calculateStudentTotal = (studentId: string) => {
    if (!exam) return { obtained: 0, total: 0, percentage: 0, grade: "F", status: "Fail" }
    const record = marksData[studentId]
    if (!record) return { obtained: 0, total: 0, percentage: 0, grade: "F", status: "Fail" }

    let obtained = 0
    let total = 0

    exam.subjects.forEach((subject) => {
      obtained += record.marks[subject.name] || 0
      total += subject.maxMarks
    })

    const percentage = total > 0 ? (obtained / total) * 100 : 0
    const grade = calculateGrade(percentage)
    const status = percentage >= 40 ? "Pass" : "Fail"

    return { obtained, total, percentage, grade, status }
  }

  const handleSubmit = async () => {
    if (!exam) return
    setSubmitting(true)
    setMessage(null)

    const records = students.map((student) => ({
      studentId: student.id,
      marks: marksData[student.id]?.marks || {},
    }))

    const result = await enterMarks({ examId, records })

    if (result.success) {
      setMessage({ type: "success", text: `Marks entered for ${result.entered} students!` })
    } else {
      setMessage({ type: "error", text: result.error || "Failed to enter marks" })
    }

    setSubmitting(false)
  }

  if (loading) {
    return <div className="space-y-6"><div className="text-center py-8">Loading...</div></div>
  }

  if (!exam) {
    return <div className="space-y-6"><div className="text-center py-8 text-red-500">Exam not found</div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enter Marks: {exam.name}</h1>
        <p className="mt-2 text-gray-600">Class {exam.className} | {exam.subjects.length} Subjects | {exam.examDate}</p>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subject-Wise Marks Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Roll</TableHead>
                  <TableHead className="w-40">Student</TableHead>
                  {exam.subjects.map((subject) => (
                    <TableHead key={subject.name} className="w-32 text-center">
                      <div>{subject.name}</div>
                      <div className="text-xs text-gray-500">Max: {subject.maxMarks}</div>
                    </TableHead>
                  ))}
                  <TableHead className="w-28 text-center">Total</TableHead>
                  <TableHead className="w-24 text-center">%</TableHead>
                  <TableHead className="w-20 text-center">Grade</TableHead>
                  <TableHead className="w-20 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const calc = calculateStudentTotal(student.id)
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.rollNumber}</TableCell>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                        <br />
                        <span className="text-xs text-gray-500">{student.studentId}</span>
                      </TableCell>
                      {exam.subjects.map((subject) => (
                        <TableCell key={subject.name} className="text-center">
                          <Input
                            type="number"
                            value={marksData[student.id]?.marks[subject.name] || ""}
                            onChange={(e) => handleMarksChange(student.id, subject.name, e.target.value)}
                            min="0"
                            max={subject.maxMarks}
                            className="w-20 text-center"
                            step="0.5"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="font-medium text-center">{calc.obtained} / {calc.total}</TableCell>
                      <TableCell className="font-medium text-center">{calc.percentage.toFixed(1)}%</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getGradeColor(calc.grade)}>{calc.grade}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={calc.status === "Pass" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {calc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting ? "Saving..." : "Save All Marks"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A+":
    case "A":
      return "bg-green-100 text-green-800"
    case "B+":
    case "B":
      return "bg-blue-100 text-blue-800"
    case "C":
      return "bg-yellow-100 text-yellow-800"
    case "D":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-red-100 text-red-800"
  }
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+"
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B+"
  if (percentage >= 60) return "B"
  if (percentage >= 50) return "C"
  if (percentage >= 40) return "D"
  return "F"
}