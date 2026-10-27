"use client"

import { useState, useEffect } from "react"
import { getStudents, deleteStudent } from "@/actions/student"
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

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  rollNumber: string
  className: string
  section: string
  gender: string
  contact: string
  admissionDate: Date
  isActive: boolean
}

export function StudentTable() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showInactive, setShowInactive] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard">("soft")
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  const fetchStudents = async () => {
    setLoading(true)
    const result = await getStudents({ page, limit: 10, search, includeInactive: showInactive })
    if (result.success) {
      setStudents(result.students as Student[])
      setTotalPages(result.totalPages)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [page, search, showInactive])

  const handleDelete = async () => {
    if (!studentToDelete) return

    const forceCascade = deleteMode === "hard"
    const result = await deleteStudent(studentToDelete.id, { forceCascade })
    if (result.success) {
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
      setDeleteMode("soft")
      fetchStudents()
    } else {
      alert(result.error)
    }
  }

  const openDeleteDialog = (student: Student, mode: "soft" | "hard" = "soft") => {
    setStudentToDelete(student)
    setDeleteMode(mode)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show Inactive
          </label>
          <Link href="/students/admission">
            <Button>Add New Student</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className={!student.isActive ? "bg-gray-50" : ""}>
                  <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Class {student.className}</Badge>
                  </TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.contact}</TableCell>
                  <TableCell>{formatDate(student.admissionDate)}</TableCell>
                  <TableCell>
                    <Badge variant={student.isActive ? "default" : "secondary"}>
                      {student.isActive ? "Active" : "Left/Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/students/${student.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {student.isActive ? (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(student, "soft")}
                          >
                            Mark Inactive
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(student, "hard")}
                          >
                            Delete Permanently
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(student, "hard")}
                        >
                          Delete Permanently
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteMode === "soft" ? "Mark Student as Inactive" : "Permanently Delete Student"}
            </DialogTitle>
            <DialogDescription>
              {deleteMode === "soft"
                ? `This will mark ${studentToDelete?.firstName} ${studentToDelete?.lastName} as "Left/Inactive". The student will be hidden from active lists but all historical records (attendance, payments, results) will be preserved.`
                : `This will PERMANENTLY delete ${studentToDelete?.firstName} ${studentToDelete?.lastName} and ALL related records (attendance, payments, results). This action CANNOT be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={deleteMode === "soft" ? "destructive" : "destructive"}
              onClick={handleDelete}
              className={deleteMode === "hard" ? "bg-red-700 hover:bg-red-800" : ""}
            >
              {deleteMode === "soft" ? "Mark Inactive" : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
