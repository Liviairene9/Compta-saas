"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import HeaderMobile from "@/components/HeaderMobile"
import { UserCircle, KeyRound, CreditCard, LogOut, ChevronDown, Bell } from "lucide-react"
import { signOut } from "next-auth/react"

interface Props {
  children: React.ReactNode
  role: string
  name: string
}

export default function DashboardLayoutClient({ children, role, name }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

        {/* Header desktop */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 bg-slate-100 border-b shadow-sm">
          <div className="flex items-center gap-3">

            {/* Cloche */}
            <button
              onClick={() => router.push("/dashboard/rappels")}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="bg-blue-700 rounded-full w-9 h-9 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(name ?? "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-14 bg-white rounded-2xl shadow-xl border border-gray-100 w-56 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b bg-slate-50">
                    <p className="text-sm font-bold text-gray-800">{name}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {role}
                    </span>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <Link
                      href="/dashboard/compte"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-slate-100 transition w-full"
                    >
                      <UserCircle size={16} className="text-blue-700" />
                      Mon compte
                    </Link>
                    <Link
                      href="/dashboard/compte/mot-de-passe"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-slate-100 transition w-full"
                    >
                      <KeyRound size={16} className="text-purple-600" />
                      Changer mot de passe
                    </Link>
                    <Link
                      href="/dashboard/compte/abonnement"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-slate-100 transition w-full"
                    >
                      <CreditCard size={16} className="text-green-600" />
                      Mon abonnement
                    </Link>
                    <div className="border-t my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth" })}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition w-full text-left"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Header mobile */}
        <HeaderMobile onMenuOpen={() => setIsMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}