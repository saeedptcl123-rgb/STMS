"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateSchoolSettings } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SettingsValues {
  schoolName: string
  shortName: string
  address: string
  phone: string
  email: string
  bankName: string
  bankBranch: string
  accountTitle: string
  accountNumber: string
  academicYear: string
  logoData: string | null
}

const MAX_LOGO_BYTES = 200 * 1024

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState<SettingsValues>(initial)
  // undefined = keep current logo, null = remove logo, string = new logo
  const [logoChange, setLogoChange] = useState<string | null | undefined>(undefined)
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const set = (key: keyof SettingsValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }))

  const onLogoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setNotice({ type: "error", text: "Sirf image file chunein (PNG/JPG)" })
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setNotice({ type: "error", text: "Logo 200 KB se chhota hona chahiye" })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      setLogoChange(dataUrl)
      setValues((prev) => ({ ...prev, logoData: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoChange(null)
    setValues((prev) => ({ ...prev, logoData: null }))
    if (fileRef.current) fileRef.current.value = ""
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)
    startTransition(async () => {
      const result = await updateSchoolSettings({
        schoolName: values.schoolName,
        shortName: values.shortName,
        address: values.address,
        phone: values.phone,
        email: values.email,
        bankName: values.bankName,
        bankBranch: values.bankBranch,
        accountTitle: values.accountTitle,
        accountNumber: values.accountNumber,
        academicYear: values.academicYear,
        logoData: logoChange,
      })
      if (result.success) {
        setLogoChange(undefined)
        setNotice({ type: "success", text: "Settings save ho gayi. Chalan aur sidebar mein nayi details nazar aayengi." })
        router.refresh()
      } else {
        setNotice({ type: "error", text: result.error || "Settings save nahi ho sakin" })
      }
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {notice && (
        <Alert className={notice.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <AlertDescription className={notice.type === "success" ? "text-green-800" : "text-red-800"}>
            {notice.text}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>School Name</Label>
            <Input value={values.schoolName} onChange={set("schoolName")} required />
          </div>
          <div className="space-y-2">
            <Label>Short Name (logo ke bajaye, max 8 characters)</Label>
            <Input value={values.shortName} onChange={set("shortName")} maxLength={8} required />
          </div>
          <div className="space-y-2">
            <Label>Current Academic Year (jaise 2026-27)</Label>
            <Input value={values.academicYear} onChange={set("academicYear")} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>
            <Input value={values.address} onChange={set("address")} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={values.phone} onChange={set("phone")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={values.email} onChange={set("email")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>School Logo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border bg-white">
            {values.logoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={values.logoData} alt="School logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-sm font-bold text-gray-500">{values.shortName || "SCH"}</span>
            )}
          </div>
          <div className="space-y-2">
            <Input ref={fileRef} type="file" accept="image/*" onChange={onLogoPick} />
            <p className="text-xs text-gray-500">PNG ya JPG, 200 KB se chhota.</p>
            {values.logoData && (
              <Button type="button" variant="outline" size="sm" onClick={removeLogo}>
                Logo hatayein
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Details (Chalan ke liye)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input value={values.bankName} onChange={set("bankName")} />
          </div>
          <div className="space-y-2">
            <Label>Branch</Label>
            <Input value={values.bankBranch} onChange={set("bankBranch")} />
          </div>
          <div className="space-y-2">
            <Label>Account Title</Label>
            <Input value={values.accountTitle} onChange={set("accountTitle")} />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input value={values.accountNumber} onChange={set("accountNumber")} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending} className="w-full md:w-auto">
        {pending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
