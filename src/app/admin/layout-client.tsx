"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Server,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react"
import { signOut } from "next-auth/react"

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/abonnements", label: "Abonnements", icon: CreditCard },
  { href: "/admin/serveur", label: "État du serveur", icon: Server },
]

interface Props {
  children: React.ReactNode
  name: string
}

export default function AdminLayoutClient({ children, name }: Props) {
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
          fixed top-0 left-0 h-full  z-40 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:flex-shrink-0
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <aside className=" bg-white shadow-xl flex flex-col min-h-screen">
          {/* Logo */}
          <div className="w-60 p-6 border-b">
            <div className="flex items-center gap-2">
              <ShieldCheck size={22} className="text-blue-700" />
              <h1 className="text-xl font-bold text-blue-700">Espace Admin</h1>
            </div>
            <p className="text-xl text-gray-500 mt-1">{name}</p>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full mt-1 inline-block">
              ADMIN
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 flex flex-col gap-2">
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xl/tight font-medium transition-colors ${
                  pathname === href
                    ? "bg-blue-700 text-white"
                    : "text-gray-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Déconnexion */}
          <div className="p-4 border-t">
            <button
              onClick={() => signOut({ callbackUrl: "/auth" })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xl font-medium text-red-500 hover:bg-red-50 w-full"
            >
              <LogOut size={30} />
              Déconnexion
            </button>
          </div>
        </aside>
      </div>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm sticky top-0 z-20">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
          >
            <Menu size={22} />
          </button>
          <h2 className="text-sm font-extrabold text-blue-600">
            Espace Admin
          </h2>
          <div className="w-9" />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}