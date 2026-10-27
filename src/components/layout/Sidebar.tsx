"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: "🏠" },
  { name: "Students", href: "/students", icon: "👨‍🎓" },
  { name: "Admission", href: "/students/admission", icon: "📝" },
  { name: "Attendance", href: "/attendance", icon: "✅" },
  { name: "Fees", href: "/fees", icon: "💰" },
  { name: "Exams", href: "/exams", icon: "📚" },
  { name: "Results", href: "/exams/results", icon: "📊" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">
          Student Management
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2026 Student Management
        </p>
      </div>
    </div>
  )
}
