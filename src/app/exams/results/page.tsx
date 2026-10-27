"use client"

import React, { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getExams, getClassResults, getResult } from "@/actions/exams"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/dashboard/StatsCard"

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

const gradeColors: Record<string, string> = {
  "A+": "bg-green-100 text-green-800",
  "A": "bg-green-100 text-green-800",
  "B+": "bg-blue-100 text-blue-800",
  "B": "bg-blue-100 text-blue-800",
  "C": "bg-yellow-100 text-yellow-800",
  "D": "bg-orange-100 text-orange-800",
  "F": "bg-red-100 text-red-800",
}

function ResultsPageContent() {
  const searchParams = useSearchParams()
  const initialExamId = searchParams.get("examId") || ""

  const [exams, setExams] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState(initialExamId)
  const [selectedClass, setSelectedClass] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [statistics, setStatistics] = useState({
    average: 0,
    highest: 0,
    lowest: 0,
    passRate: 0,
  })
  const [loading, setLoading] = useState(false)
  const [examsLoading, setExamsLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [subjectDetails, setSubjectDetails] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchExams = async () => {
      const result = await getExams()
      if (result.success) {
        setExams(result.exams)
      }
      setExamsLoading(false)
    }
    fetchExams()
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedExam || !selectedClass) return

      setLoading(true)
      const result = await getClassResults({
        examId: selectedExam,
        className: selectedClass,
      })

      if (result.success) {
        setResults(result.results || [])
        setStatistics(result.statistics || { average: 0, highest: 0, lowest: 0, passRate: 0 })
      }
      setLoading(false)
    }

    fetchResults()
  }, [selectedExam, selectedClass])

  const selectedExamData = exams.find((e) => e.id === selectedExam)

  const handleExamChange = (value: string | null) => setSelectedExam(value ?? "")
  const handleClassChange = (value: string | null) => setSelectedClass(value ?? "")

  const toggleRow = async (studentId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
      if (!subjectDetails[studentId]) {
        const result = await getResult({ examId: selectedExam, studentId })
        if (result.success && result.result) {
          const exam = await getExams()
          const examData = exam.exams.find((e: any) => e.id === selectedExam)
          if (examData) {
            const subjects = JSON.parse(examData.subjects) as string[]
            const maxMarks = JSON.parse(examData.maxMarks) as Record<string, number>
            const marks = JSON.parse(result.result.marks) as Record<string, number>
            const subjectBreakdown = subjects.map((subject) => ({
              name: subject,
              obtained: marks[subject] || 0,
              max: maxMarks[subject] || 100,
            }))
            setSubjectDetails((prev) => ({ ...prev, [studentId]: subjectBreakdown }))
          }
        }
      }
    }
    setExpandedRows(newExpanded)
  }

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '')

    if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1)
    }

    if (!cleaned.startsWith('92') && cleaned.length >= 10) {
      cleaned = '92' + cleaned
    }

    return cleaned
  }

  const sendWhatsAppAlert = (item: any) => {
    const student = item.student
    const result = item.result
    const exam = selectedExamData

    if (!exam || !result) return

    const status = result.percentage >= 40 ? "PASS" : "FAIL"
    const message = `*Exam Result Alert*

Dear Parent,

Your ward *${student.firstName} ${student.lastName}* (Roll: ${student.rollNumber}, Class: ${student.className}) has received their result for *${exam.name}*.

*Results Summary:*
📊 Total Marks: ${result.totalMarks}
📈 Percentage: ${result.percentage.toFixed(1)}%
🏅 Grade: ${result.grade}
✅ Status: ${status}

Please check the full report card for subject-wise details.

- Academy of Excellence`

    const encodedMessage = encodeURIComponent(message)
    const formattedPhone = formatPhoneNumber(student.parentContact)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
        <p className="mt-2 text-gray-600">View and manage exam results</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
<div className="space-y-2">
            <Label>Select Exam</Label>
            <Select value={selectedExam} onValueChange={handleExamChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select exam">
                  {selectedExamData ? `${selectedExamData.name} - Class ${selectedExamData.className}` : "Select exam"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name} - Class {exam.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

<div className="space-y-2">
            <Label>Select Class</Label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
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
      </div>

      {/* Statistics */}
      {selectedExam && selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Average Score"
            value={`${statistics.average}%`}
            icon="📊"
            color="primary"
          />
          <StatsCard
            title="Highest Score"
            value={`${statistics.highest}%`}
            icon="🏆"
            color="green"
          />
          <StatsCard
            title="Lowest Score"
            value={`${statistics.lowest}%`}
            icon="📉"
            color="yellow"
          />
          <StatsCard
            title="Pass Rate"
            value={`${statistics.passRate}%`}
            icon="✅"
            color="green"
          />
        </div>
      )}

      {/* Results Table */}
      {selectedExam && selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results - {selectedExamData?.name} (Class {selectedClass})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No results found for this exam/class
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10 text-center">Details</TableHead>
                    <TableHead className="w-10 text-center">Print</TableHead>
                    <TableHead className="w-10 text-center">WhatsApp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item) => (
                    <React.Fragment key={item.student.id}>
                      <TableRow
                        onClick={() => toggleRow(item.student.id)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <TableCell className="font-mono">
                          {item.student.rollNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.student.firstName} {item.student.lastName}
                        </TableCell>
                        <TableCell>
                          {item.result ? item.result.totalMarks : "-"}
                        </TableCell>
                        <TableCell>
                          {item.result ? `${item.result.percentage.toFixed(1)}%` : "-"}
                        </TableCell>
                        <TableCell>
                          {item.result ? (
                            <Badge className={gradeColors[item.result.grade] || ""}>
                              {item.result.grade}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {item.result ? (
                            item.result.percentage >= 40 ? (
                              <Badge className="bg-green-100 text-green-800">Pass</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Fail</Badge>
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {expandedRows.has(item.student.id) ? "▲" : "▼"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.result && (
                            <a
                              href={`/exams/${selectedExam}/report-card/${item.student.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm">
                                Print
                              </Button>
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.result && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => sendWhatsAppAlert(item)}
                            >
                              WhatsApp
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(item.student.id) && item.result && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-gray-50 p-4">
                              <div className="font-semibold mb-2">Subject-Wise Breakdown</div>
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {subjectDetails[item.student.id]?.map((subject: any) => (
                                  <div key={subject.name} className="bg-white p-3 rounded border">
                                    <div className="text-sm font-medium">{subject.name}</div>
                                    <div className="text-lg font-bold">
                                      {subject.obtained} / {subject.max}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {subject.max > 0 ? ((subject.obtained / subject.max) * 100).toFixed(1) : 0}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <ResultsPageContent />
    </Suspense>
  )
}
