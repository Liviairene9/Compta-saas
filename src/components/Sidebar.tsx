    "use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart2,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface SidebarProps {
  role: string
  name: string
}

const ownerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/factures", label: "Factures", icon: FileText },
  { href: "/dashboard/devis", label: "Devis", icon: FileText },
  { href: "/dashboard/rapports", label: "Rapports", icon: BarChart2 },
  { href: "/dashboard/rappels", label: "Rappels", icon: Bell },
]

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
]

export default function Sidebar({ role, name }: SidebarProps) {
  const pathname = usePathname()
  const links = role === "ADMIN" ? adminLinks : ownerLinks

  return (
    <aside className="w-64 bg-white/90 shadow-xl flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-700">Compta SaaS</h1>
        <p className="text-xl text-blue-900 mt-1">{name}</p>
        <span className="text-xs bg-blue-500 text-white/90 px-2 py-0.5 rounded-full mt-1 inline-block">
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xl font-medium transition-colors ${
              pathname === href
                ? "bg-blue-700 text-white"
                : "text-blue-800 hover:bg-slate-100"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}

        {/* Lien Admin si ADMIN */}
        {role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-slate-100 mt-4 border-t pt-4"
          >
            <ShieldCheck size={20} />
            Espace Admin
          </Link>
        )}
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-none">
        <button
          onClick={() => signOut({ callbackUrl: "/auth" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xl font-medium text-slate-600 hover:bg-red-50 hover:text-black w-full"
        >
          <LogOut size={30} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
