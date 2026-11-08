"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { loadSchoolSettings } from "@/lib/school"

const MAX_LOGO_CHARS = 300_000 // ~225 KB image as base64 data URL

export async function getSchoolSettings() {
  try {
    const settings = await loadSchoolSettings()
    return { success: true, settings }
  } catch (error) {
    console.error("Error loading settings:", error)
    return { success: false, error: "Settings load nahi ho sakin" }
  }
}

export async function updateSchoolSettings(data: {
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
  logoData?: string | null
}) {
  try {
    const required: Array<[string, string]> = [
      ["School ka naam", data.schoolName],
      ["Short name", data.shortName],
      ["Academic year", data.academicYear],
    ]
    for (const [label, value] of required) {
      if (!value || !value.trim()) return { success: false, error: `${label} zaroori hai` }
    }

    let logoData: string | null | undefined = undefined
    if (data.logoData === null) {
      logoData = null
    } else if (typeof data.logoData === "string" && data.logoData !== "") {
      if (!data.logoData.startsWith("data:image/")) {
        return { success: false, error: "Logo sirf image file ho sakti hai" }
      }
      if (data.logoData.length > MAX_LOGO_CHARS) {
        return { success: false, error: "Logo 200 KB se chhota hona chahiye" }
      }
      logoData = data.logoData
    }

    const clean = (v: string) => v.trim()
    const settings = await prisma.schoolSettings.upsert({
      where: { id: "default" },
      update: {
        schoolName: clean(data.schoolName),
        shortName: clean(data.shortName).slice(0, 8),
        address: clean(data.address),
        phone: clean(data.phone),
        email: clean(data.email),
        bankName: clean(data.bankName),
        bankBranch: clean(data.bankBranch),
        accountTitle: clean(data.accountTitle),
        accountNumber: clean(data.accountNumber),
        academicYear: clean(data.academicYear),
        ...(logoData !== undefined ? { logoData } : {}),
      },
      create: {
        id: "default",
        schoolName: clean(data.schoolName),
        shortName: clean(data.shortName).slice(0, 8),
        address: clean(data.address),
        phone: clean(data.phone),
        email: clean(data.email),
        bankName: clean(data.bankName),
        bankBranch: clean(data.bankBranch),
        accountTitle: clean(data.accountTitle),
        accountNumber: clean(data.accountNumber),
        academicYear: clean(data.academicYear),
        logoData: logoData ?? null,
      },
    })

    // Settings appear in the sidebar, chalan and dashboard, so refresh everything.
    revalidatePath("/", "layout")

    return { success: true, settings }
  } catch (error) {
    console.error("Error updating settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Settings save nahi ho sakin",
    }
  }
}
