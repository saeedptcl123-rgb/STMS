"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteStudent } from "@/actions/student"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StudentDeleteDialogProps {
  studentId: string
  studentName: string
}

export function StudentDeleteDialog({ studentId, studentName }: StudentDeleteDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard">("soft")
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const forceCascade = deleteMode === "hard"
    const result = await deleteStudent(studentId, { forceCascade })
    setLoading(false)

    if (result.success) {
      setDialogOpen(false)
      window.location.href = "/students"
    } else {
      alert(result.error)
    }
  }

  return (
    <>
      <div className="flex gap-4">
        <Button variant="destructive" onClick={() => { setDeleteMode("soft"); setDialogOpen(true); }}>
          Mark as Inactive (Left)
        </Button>
        <Button variant="outline" onClick={() => { setDeleteMode("hard"); setDialogOpen(true); }} className="border-red-500 text-red-600 hover:bg-red-50">
          Delete Permanently
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteMode === "soft" ? "Mark Student as Inactive" : "Permanently Delete Student"}
            </DialogTitle>
            <DialogDescription>
              {deleteMode === "soft"
                ? `This will mark ${studentName} as "Left/Inactive". The student will be hidden from active lists but all historical records (attendance, payments, results) will be preserved.`
                : `This will PERMANENTLY delete ${studentName} and ALL related records (attendance, payments, results). This action CANNOT be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className={deleteMode === "hard" ? "bg-red-700 hover:bg-red-800" : ""}
            >
              {loading ? "Processing..." : (deleteMode === "soft" ? "Mark Inactive" : "Delete Permanently")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}