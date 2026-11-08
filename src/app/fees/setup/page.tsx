import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { getFeeTypes, getFeeStructures } from "@/actions/fees"
import { loadSchoolSettings } from "@/lib/school"
import { FeeTypeManager, FeeStructureForm, FeeStructureList, MonthlyFeeGenerator } from "@/components/fees/FeeSetup"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FeeSetupPage() {
  const [settings, feeTypesResult, structuresResult, classRows] = await Promise.all([
    loadSchoolSettings(),
    getFeeTypes(),
    getFeeStructures(),
    prisma.student.findMany({
      select: { className: true },
      distinct: ["className"],
      orderBy: { className: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Setup</h1>
          <p className="mt-2 text-gray-600">
            Fee types banayein aur har class ki fee amount aur due date define karein
          </p>
        </div>
        <Link href="/fees">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fees
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeeTypeManager feeTypes={feeTypesResult.feeTypes} />
        <FeeStructureForm
          feeTypes={feeTypesResult.feeTypes}
          classes={classRows.map((c) => c.className)}
          academicYear={settings.academicYear}
        />
      </div>

      <MonthlyFeeGenerator
        feeTypes={feeTypesResult.feeTypes}
        classes={classRows.map((c) => c.className)}
        academicYear={settings.academicYear}
      />

      <FeeStructureList structures={structuresResult.feeStructures} />
    </div>
  )
}
