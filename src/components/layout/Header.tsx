"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-4"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-800">
          Student Management System
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Welcome, Admin</span>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">A</span>
        </div>
      </div>
    </header>
  )
}
