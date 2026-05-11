"use client"

import { Menu } from "lucide-react"

interface HeaderMobileProps {
  onMenuOpen: () => void
}

export default function HeaderMobile({ onMenuOpen }: HeaderMobileProps) {
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white/90 border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <button
        onClick={onMenuOpen}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
      >
        <Menu size={25} />
      </button>
      <h2 className="text-lg font-extrabold text-blue-600 tracking-tight">
        Compta SaaS
      </h2>
      <div className="w-9" />
    </header>
  )
}