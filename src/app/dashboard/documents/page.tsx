"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

const venteIndirecte = [
  { label: "Créer un devis", href: "/dashboard/documents/devis", color: "bg-blue-100 border-blue-200 text-blue-700" },
  { label: "Créer un bon de commande", href: "/dashboard/documents/bon-commande", color: "bg-slate-50 border-slate-200 text-slate-800" },
  { label: "Créer un bordereau de livraison", href: "/dashboard/documents/bordereau", color: "bg-slate-50 border-slate-200 text-slate-700" },
  { label: "Créer une facture", href: "/dashboard/documents/facture", color: "bg-white border-blue-200 text-blue-600" },
]

export default function DocumentsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
        <p className="text-gray-500 text-sm mt-1">Créez et gérez vos documents comptables</p>
      </div>

      {/* Vente directe */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-700">Vente directe</h2>
        <button
          onClick={() => router.push("/dashboard/documents/facture-directe")}
          className="bg-white border-4 border-dashed border-blue-300 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition group w-full"
        >
          <div className="bg-blue-700 p-4 rounded-full transition">
            <Plus size={28} className="text-white" />
          </div>
          <p className="text-blue-700 font-semibold text-xl">Créer une facture</p>
          <p className="text-gray-400 text-sm">Facturation rapide sans étape intermédiaire</p>
        </button>
      </div>

      {/* Vente indirecte */}
            <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-700">Vente indirecte</h2>
        <button
          onClick={() => router.push("/dashboard/documents/devis")}
          className="bg-green-900 border-4 border-dashed border-green-600 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition group w-full"
        >
          <div className="bg-green-100 p-4 rounded-full transition">
            <Plus size={28} className="text-green-400" />
          </div>
          <p className="text-green-700 font-semibold text-xl">Créer un devis</p>
          <p className="text-gray-400 text-sm">Facturation rapide en 4 étapes </p>
        </button>
      </div>
      </div>
  )
}