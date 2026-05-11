import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react"
import ResetPasswordButton from "./ResetPasswordButton"
import ToggleActiveButton from "./ToggleActiveButton"

export default async function UserFichePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  })

  if (!user) notFound()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fiche utilisateur</h1>
          <p className="text-gray-500 text-sm mt-1">{user.name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          user.role === "ADMIN"
            ? "bg-red-100 text-red-600"
            : user.role === "OWNER"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-600"
        }`}>
          {user.role}
        </span>
      </div>

      {/* Infos */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h2 className="font-bold text-gray-800 mb-2">Informations</h2>

        {[
          { icon: User, label: "Nom complet", value: user.name },
          { icon: Phone, label: "Téléphone", value: user.phone },
          { icon: Mail, label: "E-mail", value: user.email ?? "Non renseigné" },
          { icon: ShieldCheck, label: "Rôle", value: user.role },
          {
            icon: Calendar,
            label: "Inscrit le",
            value: new Date(user.createdAt).toLocaleDateString("fr-FR"),
          },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 py-2 border-b last:border-0">
            <div className="bg-slate-100 p-2 rounded-lg">
              <Icon size={16} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{value}</p>
            </div>
          </div>
        ))}

        {/* Statut */}
        <div className="flex items-center gap-4 py-2">
          <div className="bg-slate-100 p-2 rounded-lg">
            {user.isActive ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <XCircle size={16} className="text-red-500" />
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400">Statut</p>
            <p className={`text-sm font-semibold ${
              user.isActive ? "text-green-600" : "text-red-500"
            }`}>
              {user.isActive ? "Actif" : "Inactif"}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h2 className="font-bold text-gray-800 mb-2">Actions</h2>
        <ResetPasswordButton userId={user.id} userName={user.name} />
        <ToggleActiveButton
          userId={user.id}
          isActive={user.isActive}
          userName={user.name}
        />
      </div>
    </div>
  )
}