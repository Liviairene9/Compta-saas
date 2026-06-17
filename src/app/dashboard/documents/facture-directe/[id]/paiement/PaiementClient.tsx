"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, CreditCard } from "lucide-react"
import { enregistrerPaiementDirectAction } from "./actions"

export default function PaiementClient({ facture }: { facture: any }) {
  const router = useRouter()
  const [modePaiement, setModePaiement] = useState("Virement")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handlePaiement() {
    setLoading(true)
    await enregistrerPaiementDirectAction(facture.id, modePaiement)
    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push("/dashboard/documents"), 2000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Enregistrer le paiement</h1>
          <p className="text-gray-500 text-sm">{facture.number}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">
        {/* Résumé facture */}
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Client</span>
            <span className="text-sm font-semibold text-gray-800">{facture.client.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Numéro</span>
            <span className="text-sm font-semibold text-blue-700">{facture.number}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-1">
            <span className="text-sm font-bold text-gray-700">Montant à régler</span>
            <span className="text-lg font-bold text-blue-700">{facture.totalAmount.toLocaleString("fr-FR")} FCFA</span>
          </div>
        </div>

        {/* Mode de paiement */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">Mode de paiement</label>
          <div className="grid grid-cols-2 gap-3">
            {["Virement", "Espèces", "Mobile Money", "Chèque"].map((mode) => (
              <button
                key={mode}
                onClick={() => setModePaiement(mode)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                  modePaiement === mode
                    ? "border-blue-700 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <CreditCard size={15} />
                {mode}
              </button>
            ))}
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-semibold text-center">
            ✅ Paiement enregistré — redirection en cours...
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">
            Annuler
          </button>
          <button onClick={handlePaiement} disabled={loading || success}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm disabled:opacity-50">
            <CheckCircle size={16} />
            {loading ? "En cours..." : "Confirmer le paiement"}
          </button>
        </div>
      </div>
    </div>
  )
}