"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getResult } from "@/actions/exams"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface SubjectDetail {
  name: string
  obtained: number
  max: number
}

interface ReportCardData {
  student: {
    id: string
    firstName: string
    lastName: string
    rollNumber: string
    studentId: string
    className: string
  }
  exam: {
    id: string
    name: string
    className: string
    examDate: string
    subjects: string[]
    maxMarks: Record<string, number>
  }
  result: {
    totalMarks: number
    percentage: number
    grade: string
    marks: Record<string, number>
  }
}

const gradeColors: Record<string, string> = {
  "A+": "bg-green-100 text-green-800",
  A: "bg-green-100 text-green-800",
  "B+": "bg-blue-100 text-blue-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  F: "bg-red-100 text-red-800",
}

const SCHOOL_NAME = "Academy of Excellence"
const SCHOOL_ADDRESS = "123 Education Street, Knowledge City, KC 12345"
const SCHOOL_PHONE = "+1 (555) 123-4567"
const SCHOOL_EMAIL = "info@academyofexcellence.edu"

export default function ReportCardPage() {
  const params = useParams()
  const examId = params.id as string
  const studentId = params.studentId as string

  const [data, setData] = useState<ReportCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const result = await getResult({ examId, studentId })
      if (result.success && result.result && result.exam && result.student) {
        const subjects = JSON.parse(result.exam.subjects) as string[]
        const maxMarks = JSON.parse(result.exam.maxMarks) as Record<string, number>
        const marks = JSON.parse(result.result.marks) as Record<string, number>

        setData({
          student: result.student,
          exam: {
            ...result.exam,
            examDate: result.exam.examDate.toISOString(),
            subjects,
            maxMarks,
          },
          result: {
            ...result.result,
            marks,
          },
        })
      } else {
        setError(result.error || "Failed to load report card")
      }
      setLoading(false)
    }

    fetchData()
  }, [examId, studentId])

  const handlePrint = () => {
    window.print()
  }

  const getSubjectDetails = (): SubjectDetail[] => {
    if (!data) return []
    return data.exam.subjects.map((subject) => ({
      name: subject,
      obtained: data.result.marks[subject] || 0,
      max: data.exam.maxMarks[subject] || 100,
    }))
  }

  const totalMaxMarks = getSubjectDetails().reduce((sum, s) => sum + s.max, 0)
  const totalObtainedMarks = getSubjectDetails().reduce((sum, s) => sum + s.obtained, 0)
  const status = (data?.result.percentage ?? 0) >= 40 ? "PASS" : "FAIL"
  const statusColor = status === "PASS" ? "text-green-600" : "text-red-600"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report card...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600">{error || "Report card not found"}</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Back to Results
          </Button>
        </div>
      </div>
    )
  }

  const subjectDetails = getSubjectDetails()

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      <div className="max-w-3xl mx-auto">
        {/* Print Button - hidden on print */}
        <div className="mb-6 flex justify-end print:hidden">
          <Button onClick={handlePrint} size="lg">
            Print Report Card
          </Button>
        </div>

        {/* Report Card */}
        <div className="border-2 border-gray-300 rounded-lg p-6 print:border-0 print:p-0 print:shadow-none">
          {/* School Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">{SCHOOL_NAME}</div>
            <div className="text-gray-600 text-sm mb-1">{SCHOOL_ADDRESS}</div>
            <div className="text-gray-600 text-sm mb-1">
              Phone: {SCHOOL_PHONE} | Email: {SCHOOL_EMAIL}
            </div>
            <div className="mt-4 text-xl font-semibold text-gray-800 border-t border-gray-300 pt-4">
              STUDENT REPORT CARD
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {data.exam.name} - {formatDate(data.exam.examDate)}
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Student Name:</span>
              <span className="ml-2 text-gray-900">
                {data.student.firstName} {data.student.lastName}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Roll Number:</span>
              <span className="ml-2 text-gray-900">{data.student.rollNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Student ID:</span>
              <span className="ml-2 text-gray-900">{data.student.studentId}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Class:</span>
              <span className="ml-2 text-gray-900">{data.student.className}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Exam:</span>
              <span className="ml-2 text-gray-900">{data.exam.name}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Exam Date:</span>
              <span className="ml-2 text-gray-900">{formatDate(data.exam.examDate)}</span>
            </div>
          </div>

          {/* Subject-Wise Marks Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-2">
              Subject-Wise Marks
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-left">Subject</TableHead>
                  <TableHead className="text-center">Obtained Marks</TableHead>
                  <TableHead className="text-center">Maximum Marks</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectDetails.map((subject) => (
                  <TableRow key={subject.name} className="border-t border-gray-200">
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell className="text-center font-bold">{subject.obtained}</TableCell>
                    <TableCell className="text-center">{subject.max}</TableCell>
                    <TableCell className="text-center">
                      {subject.max > 0
                        ? `${((subject.obtained / subject.max) * 100).toFixed(1)}%`
                        : "0%"}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-bold border-t-2 border-gray-300">
                  <TableCell className="text-left">TOTAL</TableCell>
                  <TableCell className="text-center">{totalObtainedMarks}</TableCell>
                  <TableCell className="text-center">{totalMaxMarks}</TableCell>
                  <TableCell className="text-center">
                    {totalMaxMarks > 0
                      ? `${((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1)}%`
                      : "0%"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Overall Summary */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {data.result.percentage.toFixed(1)}%
                  </div>
                  <div className="text-gray-500 text-sm">Percentage</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Badge className={`${gradeColors[data.result.grade] || "bg-gray-100 text-gray-800"} text-base px-3 py-1`}>
                    Grade: {data.result.grade}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {totalObtainedMarks} / {totalMaxMarks}
                  </div>
                  <div className="text-gray-500 text-sm">Total Marks</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${statusColor}`}>{status}</div>
                  <div className="text-gray-500 text-sm">Status</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signature Lines */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t-2 border-gray-300">
            <div className="text-center">
              <div className="border-t border-gray-400 w-full mt-16"></div>
              <div className="mt-2 font-semibold text-gray-700">Principal</div>
              <div className="text-sm text-gray-500">Signature & Seal</div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 w-full mt-16"></div>
              <div className="mt-2 font-semibold text-gray-700">Class Teacher</div>
              <div className="text-sm text-gray-500">Signature</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-300 pt-4">
            <p>This is a computer-generated report card. No signature required for digital copy.</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          .no-print {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  )
}