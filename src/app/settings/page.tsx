import { loadSchoolSettings } from "@/lib/school"
import { SettingsForm } from "@/components/settings/SettingsForm"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SettingsPage() {
  const s = await loadSchoolSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">School Settings</h1>
        <p className="mt-2 text-gray-600">
          Ye details sidebar, fee chalan aur reports mein istemal hoti hain. Har school apni details yahan badal sakti hai.
        </p>
      </div>
      <SettingsForm
        initial={{
          schoolName: s.schoolName,
          shortName: s.shortName,
          address: s.address,
          phone: s.phone,
          email: s.email,
          bankName: s.bankName,
          bankBranch: s.bankBranch,
          accountTitle: s.accountTitle,
          accountNumber: s.accountNumber,
          academicYear: s.academicYear,
          logoData: s.logoData,
        }}
      />
    </div>
  )
}
