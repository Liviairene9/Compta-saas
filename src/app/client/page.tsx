import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ClientPage() {
  const session = await auth()

  if (!session) redirect("/auth")
  if (session.user.role !== "CLIENT") redirect("/dashboard")

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Bonjour, {session.user.name} !
        </h1>
        <p className="text-gray-500 mb-8">
          Consultez vos documents et factures
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-400 text-center py-8">
            Aucun document disponible pour le moment
          </p>
        </div>
      </div>
    </div>
  )
}