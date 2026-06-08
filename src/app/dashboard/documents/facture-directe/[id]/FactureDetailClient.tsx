"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, CheckCircle } from "lucide-react"
import { pdf, PDFViewer } from "@react-pdf/renderer"
import FacturePDF from "@/components/pdf/FacturePDF"
import { updateFactureStatusAction } from "../../actions"

export default function FactureDetailClient({ facture, vendeur }: { facture: any, vendeur: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(facture.status === "PAID")

  const lignes = facture.items.map((item: any) => ({
    id: item.id,
    designation: item.description,
    categorie: "",
    quantite: item.quantity,
    prixUnitaire: item.unitPrice,
    total: item.total,
  }))

  const sousTotal = lignes.reduce((acc: number, l: any) => acc + l.total, 0)
  const totalTTC = facture.totalAmount

  const factureProps = {
    numeroFacture: facture.number,
    dateFacture: new Date(facture.createdAt).toISOString().split("T")[0],
    dateEcheance: facture.dueDate ? new Date(facture.dueDate).toISOString().split("T")[0] : "",
    client: {
      nom: facture.client.name,
      adresse: facture.client.address ?? "",
      telephone: facture.client.phone ?? "",
    },
    vendeur: {
      nom: vendeur?.name ?? "",
      telephone: vendeur?.phone ?? "",
      email: vendeur?.email ?? "",
      raisonSociale: vendeur?.raisonSociale,
      adresse: vendeur?.adresse,
      ville: vendeur?.ville,
      pays: vendeur?.pays,
      numeroRCCM: vendeur?.numeroRCCM,
      numeroContribuable: vendeur?.numeroContribuable,
      numeroTVA: vendeur?.numeroTVA,
      cgv: vendeur?.cgv,
    },
    lignes,
    tva: 0,
    modePaiement: "Virement",
    sousTotal,
    montantTva: 0,
    totalTTC,
  }

  async function telechargerPDF() {
    setLoading(true)
    const blob = await pdf(<FacturePDF {...factureProps} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${facture.number}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  async function marquerPayee() {
    await updateFactureStatusAction(facture.id, "PAID")
    setPaid(true)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{facture.number}</h1>
            <p className="text-gray-500 text-sm">Aperçu de la facture</p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          {!paid && (
            <button
              onClick={marquerPayee}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm"
            >
              <CheckCircle size={16} />
              Marquer payée
            </button>
          )}
          {paid && (
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-100 text-green-600 font-semibold text-sm">
              <CheckCircle size={16} />
              Payée
            </span>
          )}
          <button
            onClick={telechargerPDF}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm disabled:opacity-50"
          >
            <Download size={16} />
            {loading ? "Génération..." : "Télécharger PDF"}
          </button>
        </div>
      </div>

      {/* Preview PDF */}
      <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200" style={{ height: "80vh" }}>
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <FacturePDF {...factureProps} />
        </PDFViewer>
      </div>
    </div>
  )
}