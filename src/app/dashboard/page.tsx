import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect("/auth")

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Bonjour, {session.user.name} !
      </h1>
      <p className="text-slate-800 mb-8">
        Bienvenue sur votre tableau de bord personnel
      </p>
      <div className="mb-6 flex justify-between  ">
        <button className="flex justify-between gap-2 rounded-xl bg-blue-800 text-white px-4 px-2 md:px-6 md:py-2.5">
        <Plus size={20}/>
         Nouvelle facture 

        </button>
                <button className="flex justify-between gap-2 rounded-xl bg-blue-800 text-white px-4 px-2 md:px-6 md:py-2.5">
        <Plus size={20}/>
         Nouveau client

        </button>

      </div>

      {/* div cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <p className="text-xl text-slate-900 font-semibold">Montant</p>
          <p className="text-xl text-slate-900">Factures réglées</p>
          <p className="text-3xl font-bold text-green-500 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-xl">
                    <p className="text-xl text-slate-900 font-semibold">Montant</p>
          <p className="text-xl text-gray-500">Factures non réglées</p>
          <p className="text-3xl font-bold text-green-600 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <p className="text-xl text-gray-500">Factures en attente</p>
          <p className="text-3xl font-bold text-red-500 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <p className="text-xl text-gray-500">Clients enregistrés</p>
          <p className="text-3xl font-bold text-red-300 mt-1">0</p>
        </div>
      </div>
    </div>
  )
}