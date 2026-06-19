"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Search, CheckCircle, Clock, XCircle, Filter } from "lucide-react"
import { updateFactureStatusAction } from "./actions"

interface Document {
  id: string
  number: string
  status?: string
  totalAmount: number
  createdAt: Date
  client: { name: string }
  type: "DEVIS" | "BON_COMMANDE" | "BORDEREAU" | "FACTURE"
}

const TABS = [
  { key: "FACTURE", label: "Factures" },
  { key: "DEVIS", label: "Devis" },
  { key: "BON_COMMANDE", label: "Bons de commande" },
  { key: "BORDEREAU", label: "Bordereaux" },
]

export default function DocumentsClient({ documents }: { documents: Document[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filtre, setFiltre] = useState<"ALL" | "PAID" | "UNPAID" | "OVERDUE">("ALL")
  const [activeTab, setActiveTab] = useState<"FACTURE" | "DEVIS" | "BON_COMMANDE" | "BORDEREAU">("FACTURE")

  const filtered = documents.filter((d) => {
    const matchTab = d.type === activeTab
    const matchSearch =
      d.number.toLowerCase().includes(search.toLowerCase()) ||
      d.client.name.toLowerCase().includes(search.toLowerCase())
    const matchFiltre = activeTab !== "FACTURE" || filtre === "ALL" || d.status === filtre
    return matchTab && matchSearch && matchFiltre
  })

  async function handleStatusChange(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await updateFactureStatusAction(id, "PAID")
  }

  function statusBadge(status?: string) {
    if (status === "PAID") return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600"><CheckCircle size={11} /> Payée</span>
    if (status === "OVERDUE") return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-500"><XCircle size={11} /> En retard</span>
    if (status === "UNPAID") return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-500"><Clock size={11} /> Impayée</span>
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">Généré</span>
  }

  function handleCardClick(doc: Document) {
    const routes: Record<string, string> = {
      FACTURE: `/dashboard/documents/facture-directe/${doc.id}`,
      DEVIS: `/dashboard/documents/devis/${doc.id}`,
      BON_COMMANDE: `/dashboard/documents/bon-commande/${doc.id}`,
      BORDEREAU: `/dashboard/documents/bordereau/${doc.id}`,
    }
    router.push(routes[doc.type])
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
        <p className="text-gray-500 text-sm mt-1">Créez et gérez vos documents comptables</p>
      </div>

      {/* Liste des documents générés */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-700">Liste des documents générés</h2>

        {/* Onglets */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recherche + filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher par numéro ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          {activeTab === "FACTURE" && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={15} className="text-gray-400" />
              {["ALL", "PAID", "UNPAID", "OVERDUE"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltre(f as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    filtre === f
                      ? "bg-blue-700 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-slate-50"
                  }`}
                >
                  {f === "ALL" ? "Toutes" : f === "PAID" ? "Payées" : f === "UNPAID" ? "Impayées" : "En retard"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm">
            <FileText size={36} className="mb-3 opacity-30" />
            <p className="text-sm">Aucun document trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleCardClick(doc)}
                className="bg-white rounded-2xl shadow-xl p-5 flex flex-col gap-3 border border-gray-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
              >
                {/* Numéro + statut */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                    {doc.number}
                  </span>
                  {statusBadge(doc.status)}
                </div>

                {/* Client */}
                <div className='flex items-center gap-2 p-2'>
                  <p className="font-semibold text-gray-800 text-sm">{doc.client.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                {/* Montant */}
                <p className="p-3 text-lg font-bold text-gray-800">
                  {(doc.totalAmount ?? 0).toLocaleString("fr-FR")} FCFA
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-auto">
                  {doc.type === "FACTURE" && doc.status !== "PAID" && (
                    <button
                      onClick={(e) => handleStatusChange(e, doc.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-green-50 text-green-600 text-xs font-semibold hover:bg-green-100 transition w-full"
                    >
                      <CheckCircle size={13} />
                      Marquer payée
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vente directe */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-700">Vente directe</h2>
        <button
          onClick={() => router.push("/dashboard/documents/facture-directe")}
          className="bg-white border-4 border-dashed border-blue-300 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition w-full"
        >
          <div className="bg-blue-700 p-4 rounded-full">
            <Plus size={28} className="text-white" />
          </div>
          <p className="text-blue-700 font-semibold text-xl">Créer une facture</p>
          <p className="text-gray-400 text-sm">Facturation rapide sans étape intermédiaire</p>
        </button>
      </div>

      {/* Vente indirecte */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-700">Vente indirecte</h2>
        <button
          onClick={() => router.push("/dashboard/documents/devis")}
          className="bg-green-400 border-4 border-dashed border-green-600 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition w-full"
        >
          <div className="bg-green-600 p-4 rounded-full">
            <Plus size={28} className="text-white bg-green-800" />
          </div>
          <p className="text-slate-700 font-semibold text-xl">Commencer un devis</p>
          <p className="text-gray-800 text-sm">Devis → Bon de commande → Bordereau → Facture</p>
        </button>
      </div>
    </div>
  )
}