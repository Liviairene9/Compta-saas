import { prisma } from "@/lib/prisma"
import { Users, CheckCircle, XCircle, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="text-left px-6 py-4 text-gray-500 font-semibold">Nom</th>
              <th className="text-left px-6 py-4 text-gray-500 font-semibold">Téléphone</th>
              <th className="text-left px-6 py-4 text-gray-500 font-semibold">Rôle</th>
              <th className="text-left px-6 py-4 text-gray-500 font-semibold">Statut</th>
              <th className="text-left px-6 py-4 text-gray-500 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">
                  <div className="flex items-center gap-2">
                    {user.role === "ADMIN" && (
                      <ShieldCheck size={16} className="text-red-500" />
                    )}
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-red-100 text-red-600"
                      : user.role === "OWNER"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.isActive ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                      <CheckCircle size={14} /> Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                      <XCircle size={14} /> Inactif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-blue-700 font-semibold hover:underline text-xs"
                  >
                    Voir la fiche →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}