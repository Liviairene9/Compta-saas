"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Trash2 } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import dynamic from "next/dynamic"
import BonCommandePDF from "@/components/pdf/BonCommandePDF"
import { deleteBonCommandeAction } from "../actions"

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
)

export default function BonCommandeDetailClient({ bonCommande, vendeur }: { bonCommande: any; vendeur: any }) {
  const router = useRouter()

  const bonProps = {
    numeroBon: bonCommande.number,
    dateBon: new Date(bonCommande.createdAt).toISOString().split("T")[0],
    client: {
      nom: bonCommande.client.name,
      adresse: bonCommande.client.address ?? "",
      telephone: bonCommande.client.phone ?? "",
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
    },
    lignes: (bonCommande.items || []).map((item: any) => ({
      id: item.id,
      designation: item.designation || "",
      categorie: item.categorie || "",
      quantite: item.quantite,
      prixUnitaire: item.prixUnitaire,
      total: item.total,
    })),
    tva: 0,
    modePaiement: "Virement",
    sousTotal: bonCommande.totalAmount,
    montantTva: 0,
    totalTTC: bonCommande.totalAmount,
  }

  async function telecharger() {
    const blob = await pdf(<BonCommandePDF {...bonProps} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${bonCommande.number}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function supprimer() {
    if (!confirm("Supprimer ce bon de commande ?")) return
    await deleteBonCommandeAction(bonCommande.id)
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
            <h1 className="text-2xl font-bold text-gray-800">{bonCommande.number}</h1>
            <p className="text-gray-500 text-sm">Aperçu du bon de commande</p>
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
          <BonCommandePDF {...bonProps} />
        </PDFViewer>
      </div>
    </div>
  )
}