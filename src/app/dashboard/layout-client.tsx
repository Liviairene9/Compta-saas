"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import HeaderMobile from "@/components/HeaderMobile"

interface Props {
  children: React.ReactNode
  role: string
  name: string
}

export default function DashboardLayoutClient({ children, role, name }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-slate-100 relative">
      {/* Overlay mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:flex-shrink-0
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar role={role} name={name} />
      </div>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HeaderMobile onMenuOpen={() => setIsMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}