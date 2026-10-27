import { prisma } from "@/lib/db"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getDashboardStats() {
  // Use local date (matching attendance page date input behavior)
  const now = new Date()
  const todayStr = now.toLocaleDateString("en-CA") // YYYY-MM-DD in local timezone
  const today = new Date(todayStr + "T00:00:00")
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalStudents,
    todayAttendance,
    recentAdmissions,
    totalPayments,
    monthlyPayments,
    activeExams,
    examResults,
    classStats,
  ] = await Promise.all([
    prisma.student.count({ where: { isActive: true } }),
    prisma.attendance.findMany({
      where: { date: { gte: today, lt: tomorrow } },
    }),
    prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.payment.aggregate({ _sum: { amountPaid: true } }),
    prisma.payment.groupBy({
      by: ["paymentDate"],
      where: { paymentDate: { gte: startOfMonth } },
      _sum: { amountPaid: true },
      orderBy: { paymentDate: "asc" },
    }),
    prisma.exam.count({ where: { examDate: { gte: today } } }),
    prisma.result.findMany({
      include: { student: true, exam: true },
    }),
    prisma.student.groupBy({
      by: ["className"],
      where: { isActive: true },
      _count: { id: true },
    }),
  ])

  const presentCount = todayAttendance.filter((a) => a.status === "present").length
  const absentCount = todayAttendance.filter((a) => a.status === "absent").length
  const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0

  const feeCollectionData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(startOfMonth)
    date.setDate(date.getDate() + i)
    const dayStr = date.toISOString().split("T")[0]
    const payment = monthlyPayments.find((p) => p.paymentDate.toISOString().split("T")[0] === dayStr)
    return { day: date.getDate(), amount: payment?._sum.amountPaid || 0 }
  })

  const examByClass = classStats.map((cls) => {
    const results = examResults.filter((r) => r.student.className === cls.className)
    const avgPercentage = results.length > 0
      ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
      : 0
    return { class: `Class ${cls.className}`, average: Math.round(avgPercentage * 10) / 10, count: cls._count.id }
  })

  const totalPending = 50000 - (totalPayments._sum.amountPaid || 0)

  return {
    totalStudents,
    attendancePercentage,
    presentCount,
    absentCount,
    recentAdmissions,
    totalCollected: totalPayments._sum.amountPaid || 0,
    totalPending: totalPending > 0 ? totalPending : 0,
    activeExams,
    feeCollectionData,
    examByClass,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return <DashboardCharts stats={stats} />
}