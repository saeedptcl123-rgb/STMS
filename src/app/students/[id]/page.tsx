import { getStudentById } from "@/actions/student"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { StudentDeleteDialog } from "@/components/students/StudentDeleteDialog"

interface StudentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params
  const result = await getStudentById(id)

  if (!result.success || !result.student) {
    notFound()
  }

  const student = result.student

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
          <p className="mt-2 text-gray-600">
            View complete information for {student.firstName} {student.lastName}
          </p>
        </div>
        <Link href="/students">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Student ID:</span>
              <span className="font-mono font-medium">{student.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Full Name:</span>
              <span className="font-medium">{student.firstName} {student.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span>{formatDate(student.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <Badge variant="secondary" className="capitalize">{student.gender}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant={student.isActive ? "default" : "secondary"}>
                {student.isActive ? "Active" : "Left/Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Class:</span>
              <Badge>Class {student.className}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Section:</span>
              <span className="font-medium">{student.section}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Roll Number:</span>
              <span className="font-medium">{student.rollNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admission Date:</span>
              <span>{formatDate(student.admissionDate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Contact Number:</span>
              <span className="font-medium">{student.contact}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{student.email || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="text-right max-w-xs">{student.address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parent/Guardian Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Parent/Guardian Name:</span>
              <span className="font-medium">{student.parentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact Number:</span>
              <span className="font-medium">{student.parentContact}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {student.isActive && (
        <StudentDeleteDialog studentId={student.id} studentName={`${student.firstName} ${student.lastName}`} />
      )}
    </div>
  )
}
