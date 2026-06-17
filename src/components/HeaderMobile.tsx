"use client"

import { Menu, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeaderMobileProps {
  onMenuOpen: () => void
  rappelsCount?: number
}

export default function HeaderMobile({ onMenuOpen, rappelsCount = 0 }: HeaderMobileProps) {
  const router = useRouter()

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <button
        onClick={onMenuOpen}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
      >
        <Menu size={22} />
      </button>
      <h2 className="text-sm font-extrabold text-blue-600 tracking-tight">
        Compta SaaS
      </h2>
      <button
        onClick={() => router.push("/dashboard/rappels")}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition"
      >
        <Bell size={20} className="text-gray-600" />
        {rappelsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
            {rappelsCount > 9 ? "9+" : rappelsCount}
          </span>
        )}
      </button>
    </header>
  )
}