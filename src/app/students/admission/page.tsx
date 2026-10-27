import { AdmissionForm } from "@/components/students/AdmissionForm"

export default function AdmissionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Admission</h1>
        <p className="mt-2 text-gray-600">
          Register new students by filling out the admission form below
        </p>
      </div>
      <AdmissionForm />
    </div>
  )
}
