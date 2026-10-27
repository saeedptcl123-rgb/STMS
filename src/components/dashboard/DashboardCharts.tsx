"use client"

import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface DashboardStats {
  totalStudents: number
  attendancePercentage: number
  presentCount: number
  absentCount: number
  recentAdmissions: Array<{
    id: string
    firstName: string
    lastName: string
    admissionDate: Date
    className: string
    section: string
  }>
  totalCollected: number
  totalPending: number
  activeExams: number
  feeCollectionData: Array<{ day: number; amount: number }>
  examByClass: Array<{ class: string; average: number; count: number }>
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number | string; dataKey?: string }> }) {
  if (!active || !payload || !payload.length) return null
  const item = payload[0]
  const isCurrency = item.dataKey === "amount" || item.name.toLowerCase().includes("fee") || item.name.toLowerCase().includes("amount") || item.name.toLowerCase().includes("collected")
  const formattedValue = typeof item.value === "number" && isCurrency 
    ? `Rs. ${item.value.toLocaleString()}` 
    : item.value
  return (
    <div className="bg-white p-3 rounded shadow border">
      <p className="font-medium">{item.name}</p>
      <p className="text-lg font-bold">{formattedValue}</p>
    </div>
  )
}

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const recentActivities = stats.recentAdmissions.map((student) => ({
    id: student.id,
    type: "admission" as const,
    description: `New student admitted: ${student.firstName} ${student.lastName}`,
    date: student.admissionDate,
    student: `Class ${student.className} - ${student.section}`,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of key metrics and performance indicators
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon="👨‍🎓"
          color="primary"
        />
        <StatsCard
          title="Active Exams"
          value={stats.activeExams}
          icon="📚"
          color="purple"
        />
        <StatsCard
          title="Fee Collected"
          value={`Rs. ${stats.totalCollected.toLocaleString()}`}
          description={`Pending: Rs. ${stats.totalPending.toLocaleString()}`}
          icon="💰"
          color="yellow"
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendancePercentage}%`}
          description={`${stats.presentCount} Present / ${stats.absentCount} Absent`}
          icon="✅"
          color="green"
        />
      </div>

      {/* Charts Row 1: Fee Collection & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Fee Collection Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.feeCollectionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis type="number" tickFormatter={(v) => `Rs. ${v.toLocaleString()}`} />
                  <YAxis type="category" dataKey="day" width={50} tickFormatter={(v) => `${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Summary Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <PieChart
                    width={300}
                    height={200}
                  >
                    <Pie
                      data={[
                        { name: "Present", value: stats.presentCount, fill: "#22c55e" },
                        { name: "Absent", value: stats.absentCount, fill: "#ef4444" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {stats.presentCount > 0 && <Cell fill="#22c55e" />}
                      {stats.absentCount > 0 && <Cell fill="#ef4444" />}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", width: "100%", marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ef4444", flexShrink: 0 }} />
                      <span className="text-sm text-gray-700 whitespace-nowrap">Absent</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22c55e", flexShrink: 0 }} />
                      <span className="text-sm text-gray-700 whitespace-nowrap">Present</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center md:items-start text-center md:text-left">
                <p className="text-4xl font-bold text-green-600">{stats.presentCount}</p>
                <p className="text-gray-500">Present</p>
                <p className="text-2xl font-bold text-red-600 mt-4">{stats.absentCount}</p>
                <p className="text-gray-500">Absent</p>
                <p className="text-xl font-bold text-gray-900 mt-4">{stats.attendancePercentage}%</p>
                <p className="text-gray-500">Overall Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Exam Performance by Class */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Average Exam Performance by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.examByClass}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis domain={[0, "auto"]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="average" fill="#8b5cf6" name="Avg %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/students/new" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                <p className="text-3xl">➕</p>
                <p className="font-medium mt-2">Add Student</p>
              </a>
              <a href="/attendance" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                <p className="text-3xl">📋</p>
                <p className="font-medium mt-2">Mark Attendance</p>
              </a>
              <a href="/fees" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                <p className="text-3xl">💰</p>
                <p className="font-medium mt-2">Collect Fees</p>
              </a>
              <a href="/exams" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                <p className="text-3xl">📝</p>
                <p className="font-medium mt-2">Create Exam</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={recentActivities} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}