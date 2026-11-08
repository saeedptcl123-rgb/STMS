"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { createStudent } from "@/actions/student"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const HEADERS = [
  "firstName", "lastName", "rollNumber", "className", "section", "dateOfBirth",
  "gender", "contact", "email", "address", "parentName", "parentContact",
]

const SAMPLE_ROW = [
  "Ali", "Khan", "1", "11", "A", "2010-05-14", "male", "03001234567", "", "Safoora, Karachi", "Ahmed Khan", "03001234567",
]

// Splits one CSV line. Values must not contain commas (keep addresses without commas).
function parseLine(line: string): string[] {
  return line.split(",").map((v) => v.trim())
}

export function ImportStudents() {
  const [text, setText] = useState("")
  const [results, setResults] = useState<Array<{ row: number; name: string; ok: boolean; message: string }>>([])
  const [running, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(
    `${HEADERS.join(",")}\n${SAMPLE_ROW.join(",")}\n`
  )}`

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setText(await file.text())
    setResults([])
    setError(null)
  }

  const runImport = () => {
    setError(null)
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
    if (lines.length < 2) {
      setError("CSV mein header aur kam az kam ek row honi chahiye")
      return
    }
    const header = parseLine(lines[0])
    const missing = HEADERS.filter((h) => !header.includes(h) && !["email"].includes(h))
    if (missing.length) {
      setError(`Ye columns CSV mein nahi hain: ${missing.join(", ")}`)
      return
    }

    startTransition(async () => {
      const out: Array<{ row: number; name: string; ok: boolean; message: string }> = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i])
        const record: Record<string, string> = {}
        header.forEach((h, idx) => (record[h] = values[idx] ?? ""))

        const fd = new FormData()
        for (const key of HEADERS) fd.append(key, record[key] ?? "")

        const name = `${record.firstName} ${record.lastName}`.trim() || `Row ${i + 1}`
        const result = await createStudent(fd)
        out.push({
          row: i + 1,
          name,
          ok: result.success,
          message: result.success ? "Add ho gaya" : result.error || "Error",
        })
        setResults([...out])
      }
    })
  }

  const okCount = results.filter((r) => r.ok).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Template download karein</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Ye CSV file khol kar students ki details bhariye. Excel mein bhi bhar sakte hain, lekin <b>Save As → CSV (Comma delimited)</b> karke save karein.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>gender: male, female ya other</li>
            <li>dateOfBirth: 2010-05-14 jaisa format</li>
            <li>address aur naam mein comma (,) na ho</li>
            <li>email khali chhod sakte hain</li>
          </ul>
          <a href={templateHref} download="students-template.csv" className="inline-block rounded-md border px-3 py-2 font-medium hover:bg-gray-50">
            Template CSV download karein
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: File chunein ya text paste karein</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full rounded-md border p-2 font-mono text-xs"
            placeholder={HEADERS.join(",")}
          />
          <Button onClick={runImport} disabled={running || !text.trim()} className="w-full">
            {running ? "Import ho raha hai..." : "Students import karein"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Result: {okCount} add hue, {results.length - okCount} nahi hue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2">Row</th>
                    <th className="py-2">Naam</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.row} className="border-b">
                      <td className="py-2">{r.row}</td>
                      <td className="py-2">{r.name}</td>
                      <td className={`py-2 ${r.ok ? "text-green-700" : "text-red-600"}`}>{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Link href="/students" className="font-medium underline">Students list par jayein</Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
