import { prisma } from "@/lib/db"

export const DEFAULT_FEE_TYPES = [
  "Admission Fee",
  "Registration Fee",
  "Tuition Fee",
  "Monthly Fee",
  "Annual Fee",
  "Transport Charges",
]

function defaultAcademicYear() {
  const y = new Date().getFullYear()
  return `${y}-${String(y + 1).slice(-2)}`
}

export const DEFAULT_SCHOOL_SETTINGS = {
  schoolName: "Your School Name",
  shortName: "SCH",
  address: "School address",
  phone: "",
  email: "",
  bankName: "",
  bankBranch: "",
  accountTitle: "",
  accountNumber: "",
  academicYear: defaultAcademicYear(),
  logoData: null as string | null,
}

export type SchoolSettingsData = typeof DEFAULT_SCHOOL_SETTINGS

// Returns the single school settings row, creating it with defaults on first use.
export async function loadSchoolSettings(): Promise<SchoolSettingsData> {
  const row = await prisma.schoolSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", ...DEFAULT_SCHOOL_SETTINGS },
  })
  return row
}
