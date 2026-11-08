import { loadSchoolSettings } from "@/lib/school"
import { LoginForm } from "@/components/auth/LoginForm"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const settings = await loadSchoolSettings()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="text-center space-y-2">
          {settings.logoData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoData} alt={settings.schoolName} className="mx-auto h-16 w-16 object-contain" />
          ) : (
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
              {settings.shortName}
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-900">{settings.schoolName}</h1>
          <p className="text-sm text-gray-500">Admin login</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
