"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Trash2 } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import dynamic from "next/dynamic"
import DevisPDF from "@/components/pdf/DevisPDF"
import { deleteDevisAction } from "../actions"

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
)

export default function DevisDetailClient({ devis, vendeur }: { devis: any; vendeur: any }) {
  const router = useRouter()

  const montantRemise = (devis.totalAmount * (devis.remise ?? 0)) / 100

  const devisProps = {
    numeroDevis: devis.number,
    dateDevis: new Date(devis.createdAt).toISOString().split("T")[0],
    dateValidite: devis.dateValidite || "",
    client: {
      nom: devis.client.name,
      adresse: devis.client.address ?? "",
      telephone: devis.client.phone ?? "",
      ifu: devis.client.ifu ?? "",
    },
    vendeur: {
      nom: vendeur?.name ?? "",
      telephone: vendeur?.phone ?? "",
      email: vendeur?.email ?? "",
      raisonSociale: vendeur?.raisonSociale ?? "",
      adresse: vendeur?.adresse ?? "",
      ville: vendeur?.ville ?? "",
      pays: vendeur?.pays ?? "",
      numeroRCCM: vendeur?.numeroRCCM ?? "",
      numeroContribuable: vendeur?.numeroContribuable ?? "",
      numeroTVA: vendeur?.numeroTVA ?? "",
      cgv: vendeur?.cgv ?? "",
    },
    lignes: (devis.items || []).map((item: any) => ({
      id: item.id,
      designation: item.designation || "",
      categorie: item.categorie || "",
      quantite: item.quantite,
      prixUnitaire: item.prixUnitaire,
      total: item.total,
      prixUnitaireFormate: Math.floor(item.prixUnitaire).toLocaleString("de-DE"),
      totalFormate: Math.floor(item.total).toLocaleString("de-DE"),
    })),
    remise: devis.remise ?? 0,
    montantRemiseFormate: Math.floor(montantRemise).toLocaleString("de-DE"),
    tva: 19.25,
    modePaiement: "Virement",
    conditionsReglement: devis.conditionsReglement ?? "",
    delaisLivraison: devis.delaisLivraison ?? "",
    sousTotalFormate: Math.floor(devis.totalAmount).toLocaleString("de-DE"),
    totalHTFormate: Math.floor(devis.totalAmount).toLocaleString("de-DE"),
    montantTvaFormate: "0",
    totalTTCFormate: Math.floor(devis.totalAmount).toLocaleString("de-DE"),
    totalEnLettres: "",
  }

  async function telecharger() {
    const blob = await pdf(<DevisPDF {...devisProps} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${devis.number}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function supprimer() {
    if (!confirm("Supprimer ce devis ?")) return
    await deleteDevisAction(devis.id)
    router.push("/dashboard/documents")
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{devis.number}</h1>
            <p className="text-gray-500 text-sm">Aperçu du devis</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={supprimer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition text-sm">
            <Trash2 size={15} /> Supprimer
          </button>
          <button onClick={telecharger}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm">
            <Download size={15} /> Télécharger PDF
          </button>
        </div>
      </div>
      <div style={{ width: "100%", height: "80vh", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }} showToolbar={false}>
          <DevisPDF {...devisProps} />
        </PDFViewer>
      </div>
    </div>
  )
}