import { ImportStudents } from "@/components/students/ImportStudents"

export default function ImportStudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import Students</h1>
        <p className="mt-2 text-gray-600">Excel/CSV se students ek saath add karein</p>
      </div>
      <ImportStudents />
    </div>
  )
}
