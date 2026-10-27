"use client"

import { useState, useEffect } from "react"
import { getExams, createExam, deleteExam } from "@/actions/exams"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ examId: string; examName: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [examName, setExamName] = useState("")
  const [className, setClassName] = useState("")
  const [subjects, setSubjects] = useState("")
  const [maxMarks, setMaxMarks] = useState("")
  const [examDate, setExamDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchExams = async () => {
    const result = await getExams()
    if (result.success) {
      setExams(result.exams)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleDeleteExam = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    const result = await deleteExam(deleteConfirm.examId)
    if (result.success) {
      setMessage({ type: "success", text: `Exam "${deleteConfirm.examName}" deleted successfully!` })
      fetchExams()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to delete exam" })
    }
    setDeleting(false)
    setDeleteConfirm(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const subjectsList = subjects.split(",").map((s) => s.trim()).filter(Boolean)
    const maxMarksObj: Record<string, number> = {}
    subjectsList.forEach((subject) => {
      maxMarksObj[subject] = parseInt(maxMarks) || 100
    })

    const result = await createExam({
      name: examName,
      className,
      subjects: subjectsList,
      maxMarks: maxMarksObj,
      examDate,
    })

    if (result.success) {
      setMessage({ type: "success", text: "Exam created successfully!" })
      setShowForm(false)
      setExamName("")
      setClassName("")
      setSubjects("")
      setMaxMarks("")
      setExamDate("")
      fetchExams()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to create exam" })
    }

    setSubmitting(false)
  }

  const handleClassChange = (value: string | null) => setClassName(value ?? "")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="mt-2 text-gray-600">Create and manage examinations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Exam"}
        </Button>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Create Exam Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exam Name</Label>
                  <Input
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g., Midterm, Final"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={className} onValueChange={handleClassChange}>
                    <SelectTrigger>
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
                  <Label>Subjects (comma-separated)</Label>
                  <Input
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    placeholder="e.g., Math, Science, English"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Marks per Subject</Label>
                  <Input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    placeholder="e.g., 100"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exam Date</Label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Exam"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>Examinations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : exams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No exams created yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>
                      <Badge>Class {exam.className}</Badge>
                    </TableCell>
                    <TableCell>
                      {JSON.parse(exam.subjects).join(", ")}
                    </TableCell>
                    <TableCell>{formatDate(exam.examDate)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <a href={`/exams/${exam.id}/marks`}>
                          <Button variant="default" size="sm">
                            Enter Marks
                          </Button>
                        </a>
                        <a href={`/exams/results?examId=${exam.id}`}>
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                        </a>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirm({ examId: exam.id, examName: exam.name })}
                        >
                          Delete
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

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Exam</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.examName}"</strong>?
              This will also delete all associated results and marks.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteExam} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}