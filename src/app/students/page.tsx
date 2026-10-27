import { StudentTable } from "@/components/students/StudentTable"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="mt-2 text-gray-600">
            View and manage all registered students
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>
      <StudentTable />
    </div>
  )
}