"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function markAttendance(data: {
  date: string
  className: string
  records: Array<{
    studentId: string
    status: "present" | "absent" | "leave"
  }>
}) {
  try {
    const attendanceDate = new Date(data.date)

    for (const record of data.records) {
      await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: record.studentId,
            date: attendanceDate,
          },
        },
        update: {
          status: record.status,
        },
        create: {
          studentId: record.studentId,
          date: attendanceDate,
          status: record.status,
          classId: data.className,
        },
      })
    }

    revalidatePath("/attendance")
    revalidatePath("/")

    return { success: true, marked: data.records.length }
  } catch (error) {
    console.error("Error marking attendance:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark attendance",
    }
  }
}

export async function getAttendance(params: {
  date: string
  className: string
}) {
  try {
    const attendanceDate = new Date(params.date)

    const students = await prisma.student.findMany({
      where: { className: params.className },
      orderBy: { rollNumber: "asc" },
    })

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: attendanceDate,
        classId: params.className,
      },
    })

    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.studentId, record.status])
    )

    const records = students.map((student) => ({
      student,
      status: (attendanceMap.get(student.id) as "present" | "absent" | "leave") || null,
    }))

    const total = students.length
    const present = attendanceRecords.filter((r) => r.status === "present").length
    const absent = attendanceRecords.filter((r) => r.status === "absent").length
    const leave = attendanceRecords.filter((r) => r.status === "leave").length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return {
      success: true,
      records,
      summary: {
        total,
        present,
        absent,
        leave,
        percentage,
      },
    }
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return {
      success: false,
      records: [],
      summary: {
        total: 0,
        present: 0,
        absent: 0,
        leave: 0,
        percentage: 0,
      },
    }
  }
}

export async function getStudentAttendance(studentId: string) {
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
    })

    const totalDays = records.length
    const presentDays = records.filter((r) => r.status === "present").length
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

    return {
      success: true,
      records: records.map((r) => ({
        date: r.date,
        status: r.status,
      })),
      percentage,
    }
  } catch (error) {
    console.error("Error fetching student attendance:", error)
    return {
      success: false,
      records: [],
      percentage: 0,
    }
  }
}
