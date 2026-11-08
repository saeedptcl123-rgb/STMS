"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"

const navigation = [
  { name: "Dashboard", href: "/", icon: "🏠" },
  { name: "Students", href: "/students", icon: "👨‍🎓" },
  { name: "Admission", href: "/students/admission", icon: "📝" },
  { name: "Attendance", href: "/attendance", icon: "✅" },
  { name: "Fees", href: "/fees", icon: "💰" },
  { name: "Exams", href: "/exams", icon: "📚" },
  { name: "Results", href: "/exams/results", icon: "📊" },
  { name: "Fee Setup", href: "/fees/setup", icon: "🧾" },
  { name: "Reports", href: "/reports", icon: "📈" },
  { name: "Import Students", href: "/students/import", icon: "📥" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
]

interface SidebarProps {
  schoolName: string
  shortName: string
  logoData: string | null
}

export function Sidebar({ schoolName, shortName, logoData }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="flex items-center justify-center gap-3 h-16 border-b border-gray-200 px-4">
        {logoData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoData} alt={`${schoolName} logo`} className="h-9 w-9 object-contain" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
            {shortName}
          </span>
        )}
        <h1 className="text-base font-bold text-primary truncate" title={schoolName}>
          {schoolName}
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
      <div className="p-4 border-t border-gray-200 space-y-3">
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center">© 2026 {schoolName}</p>
      </div>
    </div>
  )
}
