"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowLeft, Download, Save, CheckCircle, Pencil, ArrowRight } from "lucide-react"
import { pdf, PDFViewer } from "@react-pdf/renderer"
import FacturePDF from "@/components/pdf/FacturePDF"
import { useSession } from "next-auth/react"
import { saveFactureAction, deleteFactureAction } from "./actions"
import ClientSelector from "@/components/ClientSelector"

interface LigneArticle {
  id: number
  designation: string
  categorie: string
  quantite: number
  prixUnitaire: number
  total: number
}

export default function FactureDirectePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const today = new Date()
  const echeance = new Date(today)
  echeance.setMonth(echeance.getMonth() + 1)
  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const [etape, setEtape] = useState<"formulaire" | "apercu">("formulaire")
  const [factureId, setFactureId] = useState<string | null>(null)
  const [client, setClient] = useState({ nom: "", adresse: "", telephone: "" })
  const [numeroFacture] = useState(`FAC-${Date.now().toString().slice(-6)}`)
  const [dateFacture] = useState(formatDate(today))
  const [dateEcheance] = useState(formatDate(echeance))
  const [tva, setTva] = useState(0)
  const [modePaiement, setModePaiement] = useState("Virement")
  const [vendeurInfo, setVendeurInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lignes, setLignes] = useState<LigneArticle[]>([
    { id: 1, designation: "", categorie: "", quantite: 1, prixUnitaire: 0, total: 0 },
  ])

  useEffect(() => {
    async function fetchVendeur() {
      const res = await fetch("/api/compte")
      const data = await res.json()
      setVendeurInfo(data)
    }
    fetchVendeur()
  }, [])

  const sousTotal = lignes.reduce((acc, l) => acc + l.total, 0)
  const montantTva = (sousTotal * tva) / 100
  const totalTTC = sousTotal + montantTva

const factureProps = {
  numeroFacture,
  dateFacture,
  dateEcheance,
  client,
  vendeur: {
    nom: session?.user?.name ?? "Mon Entreprise",
    telephone: session?.user?.phone ?? "",
    email: session?.user?.email ?? "",
    raisonSociale: vendeurInfo?.raisonSociale,
    adresse: vendeurInfo?.adresse,
    ville: vendeurInfo?.ville,
    pays: vendeurInfo?.pays,
    numeroRCCM: vendeurInfo?.numeroRCCM,
    numeroContribuable: vendeurInfo?.numeroContribuable,
    numeroTVA: vendeurInfo?.numeroTVA,
    cgv: vendeurInfo?.cgv,
  },
  lignes: lignes.map(l => ({
    ...l,
    prixUnitaireFormate: Math.floor(l.prixUnitaire).toLocaleString("de-DE"),
    totalFormate: Math.floor(l.total).toLocaleString("de-DE"),
  })),
  tva,
  modePaiement,
  sousTotalFormate: Math.floor(sousTotal).toLocaleString("de-DE"),
  montantTvaFormate: Math.floor(montantTva).toLocaleString("de-DE"),
  totalTTCFormate: Math.floor(totalTTC).toLocaleString("de-DE"),
  totalEnLettres: nombreEnLettres(Math.round(totalTTC)).toUpperCase() + " FRANCS CFA",
}
function nombreEnLettres(n: number): string {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
    "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"]
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"]

  if (n === 0) return "zéro"
  if (n < 0) return "moins " + nombreEnLettres(-n)

  let result = ""
  if (n >= 1000000) {
    result += nombreEnLettres(Math.floor(n / 1000000)) + " million "
    n %= 1000000
  }
  if (n >= 1000) {
    if (Math.floor(n / 1000) === 1) result += "mille "
    else result += nombreEnLettres(Math.floor(n / 1000)) + " mille "
    n %= 1000
  }
  if (n >= 100) {
    if (Math.floor(n / 100) === 1) result += "cent "
    else result += units[Math.floor(n / 100)] + " cent "
    n %= 100
  }
  if (n >= 20) {
    result += tens[Math.floor(n / 10)]
    if (n % 10 !== 0) result += "-" + units[n % 10]
    result += " "
  } else if (n > 0) {
    result += units[n] + " "
  }
  return result.trim()
}
  function updateLigne(id: number, field: keyof LigneArticle, value: string | number) {
    setLignes((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const updated = { ...l, [field]: value }
        updated.total = updated.quantite * updated.prixUnitaire
        return updated
      })
    )
  }

  function ajouterLigne() {
    setLignes((prev) => [
      ...prev,
      { id: Date.now(), designation: "", categorie: "", quantite: 1, prixUnitaire: 0, total: 0 },
    ])
  }

  function supprimerLigne(id: number) {
    if (lignes.length === 1) return
    setLignes((prev) => prev.filter((l) => l.id !== id))
  }

  async function enregistrer() {
    if (!client.nom) {
      alert("Veuillez renseigner le nom du client")
      return
    }
    setLoading(true)
    const result = await saveFactureAction({
      numeroFacture,
      clientNom: client.nom,
      clientAdresse: client.adresse,
      clientTelephone: client.telephone,
      lignes,
      tva,
      modePaiement,
      sousTotal,
      montantTva,
      totalTTC,
      dateFacture,
      dateEcheance,
    })
    if (result?.id) setFactureId(result.id)
    setLoading(false)
    setEtape("apercu")
  }

  async function telechargerPDF() {
    const blob = await pdf(<FacturePDF {...factureProps} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${numeroFacture}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function supprimer() {
    if (!factureId) return
    if (!confirm("Supprimer cette facture définitivement ?")) return
    await deleteFactureAction(factureId)
    router.push("/dashboard/documents")
  }

  // ===== FORMULAIRE =====
  if (etape === "formulaire") {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between my-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nouvelle facture</h1>
              <p className="text-gray-500 text-sm">Vente directe</p>
            </div>
          </div>
          <button onClick={() => router.push("/dashboard/documents")}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
            Documents <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-6">

          {/* Numéro + dates */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Numéro de facture</label>
              <input value={numeroFacture} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Date de facturation</label>
              <input value={dateFacture} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Date d'échéance</label>
              <input value={dateEcheance} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
            </div>
          </div>

          {/* Informations client */}
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-3">Informations client</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              <ClientSelector onSelect={(c) => setClient({ nom: c.nom, adresse: c.adresse, telephone: c.telephone })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Nom du client *</label>
                <input type="text" required placeholder="Ex: Jean Dupont" value={client.nom}
                  onChange={(e) => setClient({ ...client, nom: e.target.value })}
                  className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Adresse</label>
                <input type="text" placeholder="Ex: Yaoundé, Cameroun" value={client.adresse}
                  onChange={(e) => setClient({ ...client, adresse: e.target.value })}
                  className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Téléphone</label>
                <input type="text" placeholder="Ex: +237 6XXXXXXXX" value={client.telephone}
                  onChange={(e) => setClient({ ...client, telephone: e.target.value })}
                  className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
          </div>

          {/* Articles */}
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-3">Articles</h2>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-3 py-3 text-gray-500 font-semibold">Désignation</th>
                    <th className="text-left px-3 py-3 text-gray-500 font-semibold">Catégorie</th>
                    <th className="text-left px-3 py-3 text-gray-500 font-semibold">Qté</th>
                    <th className="text-left px-3 py-3 text-gray-500 font-semibold">Prix unit.</th>
                    <th className="text-left px-3 py-3 text-gray-500 font-semibold">Total</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne) => (
                    <tr key={ligne.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <input type="text" placeholder="Ex: Paquet de chips" value={ligne.designation}
                          onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                          className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" placeholder="Ex: Alimentaire" value={ligne.categorie}
                          onChange={(e) => updateLigne(ligne.id, "categorie", e.target.value)}
                          className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={1} value={ligne.quantite}
                          onChange={(e) => updateLigne(ligne.id, "quantite", Number(e.target.value))}
                          className="w-20 border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} value={ligne.prixUnitaire}
                          onChange={(e) => updateLigne(ligne.id, "prixUnitaire", Number(e.target.value))}
                          className="w-28 border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-800">
                        {ligne.total.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => supprimerLigne(ligne.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-col gap-3">
              {lignes.map((ligne, index) => (
                <div key={ligne.id} className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-600">Article {index + 1}</span>
                    <button onClick={() => supprimerLigne(ligne.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Désignation</label>
                    <input type="text" value={ligne.designation}
                      onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                      className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">Quantité</label>
                      <input type="number" min={1} value={ligne.quantite}
                        onChange={(e) => updateLigne(ligne.id, "quantite", Number(e.target.value))}
                        className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">Prix unitaire</label>
                      <input type="number" min={0} value={ligne.prixUnitaire}
                        onChange={(e) => updateLigne(ligne.id, "prixUnitaire", Number(e.target.value))}
                        className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="font-bold text-blue-700">{ligne.total.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={ajouterLigne} className="mt-3 flex items-center gap-2 text-blue-700 text-sm font-semibold hover:underline">
              <Plus size={16} />
              Ajouter un article
            </button>
          </div>

          {/* Totaux */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-600">TVA (%)</label>
              <input type="number" min={0} max={100} value={tva}
                onChange={(e) => setTva(Number(e.target.value))}
                className="w-20 border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 w-full md:w-72 flex flex-col gap-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span>{sousTotal.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>TVA ({tva}%)</span>
                <span>{montantTva.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
                <span>Total TTC</span>
                <span>{totalTTC.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="flex flex-col gap-1 w-full md:w-64">
            <label className="text-sm font-semibold text-gray-600">Mode de paiement</label>
            <select value={modePaiement} onChange={(e) => setModePaiement(e.target.value)}
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option>Virement</option>
              <option>Espèces</option>
              <option>Mobile Money</option>
              <option>Chèque</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
            <button type="button" onClick={() => router.back()}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm w-full sm:w-auto">
              Annuler
            </button>
            <button type="button" onClick={enregistrer} disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm w-full sm:w-auto disabled:opacity-50">
              <Save size={16} />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== APERCU =====
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setEtape("formulaire")} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{numeroFacture}</h1>
            <p className="text-green-600 text-sm font-semibold">✅ Facture enregistrée avec succès</p>
          </div>
        </div>

        {/* Boutons apercu */}
        <div className="flex gap-3 flex-wrap justify-end">
          <button onClick={() => setEtape("formulaire")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">
            <Pencil size={15} />
            Modifier
          </button>
          <button onClick={supprimer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition text-sm">
            <Trash2 size={15} />
            Supprimer
          </button>
          <button onClick={telechargerPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm">
            <Download size={15} />
            Télécharger PDF
          </button>
          {factureId && (
            <button onClick={() => router.push(`/dashboard/documents/facture-directe/${factureId}/paiement`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm">
              <CheckCircle size={15} />
              Enregistrer paiement
            </button>
          )}
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