"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowLeft, Download, ArrowRight, Save, Pencil } from "lucide-react"
import { pdf, PDFViewer } from "@react-pdf/renderer"
import { useSession } from "next-auth/react"
import DevisPDF from "@/components/pdf/DevisPDF"
import ClientSelector from "@/components/ClientSelector"
import { saveDevisAction, deleteDevisAction } from "./actions"

interface LigneArticle {
  id: number
  designation: string
  categorie: string
  quantite: number
  prixUnitaire: number
  total: number
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

export default function DevisPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const today = new Date()
  const validite = new Date(today)
  validite.setDate(validite.getDate() + 30)
  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const [etape, setEtape] = useState<"formulaire" | "apercu">("formulaire")
  const [devisId, setDevisId] = useState<string | null>(null)

  // Infos client
  const [client, setClient] = useState({ nom: "", adresse: "", telephone: "", ifu: "" })

  // Refs document
  const [numeroDevis] = useState(`DEV-${Date.now().toString().slice(-6)}`)
  const [dateDevis] = useState(formatDate(today))
  const [dateValidite] = useState(formatDate(validite))

  // Articles
  const [lignes, setLignes] = useState<LigneArticle[]>([
    { id: 1, designation: "", categorie: "", quantite: 1, prixUnitaire: 0, total: 0 },
  ])

  // Financier
  const [remise, setRemise] = useState(0)
  const [tva, setTva] = useState(19.25)
  const [modePaiement, setModePaiement] = useState("Virement")
  const [conditionsReglement, setConditionsReglement] = useState("30% d'acompte à la commande, solde à la livraison")
  const [delaisLivraison, setDelaisLivraison] = useState("")

  const [vendeurInfo, setVendeurInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchVendeur() {
      const res = await fetch("/api/compte")
      const data = await res.json()
      setVendeurInfo(data)
    }
    fetchVendeur()
  }, [])

  const sousTotal = lignes.reduce((acc, l) => acc + l.total, 0)
  const montantRemise = (sousTotal * remise) / 100
  const totalHT = sousTotal - montantRemise
  const montantTva = (totalHT * tva) / 100
  const totalTTC = totalHT + montantTva
  const totalEnLettres = nombreEnLettres(Math.round(totalTTC)) + " francs CFA"

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

  const devisProps = {
    numeroDevis,
    dateDevis,
    dateValidite,
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
    lignes,
    remise,
    montantRemise,
    tva,
    modePaiement,
    conditionsReglement,
    delaisLivraison,
    sousTotal,
    totalHT,
    montantTva,
    totalTTC,
    totalEnLettres,
  }

  async function enregistrer() {
    if (!client.nom) { alert("Veuillez renseigner le nom du client"); return }
    setLoading(true)
    const result = await saveDevisAction({
      numeroDevis,
      clientNom: client.nom,
      clientAdresse: client.adresse,
      clientTelephone: client.telephone,
      clientIfu: client.ifu,
      totalTTC,
      dateValidite,
      remise,
      conditionsReglement,
      delaisLivraison,
    })
    if ((result as any)?.id) setDevisId((result as any).id)
    setLoading(false)
    setEtape("apercu")
  }

  async function telechargerPDF() {
    const blob = await pdf(<DevisPDF {...devisProps} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${numeroDevis}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function supprimer() {
    if (!devisId) return
    if (!confirm("Supprimer ce devis définitivement ?")) return
    await deleteDevisAction(devisId)
    router.push("/dashboard/documents")
  }

  function documentSuivant() {
    localStorage.setItem("devis-data", JSON.stringify({
      client, lignes, tva, remise, modePaiement, sousTotal, totalHT, montantTva, totalTTC
    }))
    router.push("/dashboard/documents/bon-commande")
  }

  // ===== APERCU =====
  if (etape === "apercu") {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setEtape("formulaire")} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{numeroDevis}</h1>
              <p className="text-green-600 text-sm font-semibold">✅ Devis enregistré avec succès</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setEtape("formulaire")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">
              <Pencil size={15} /> Modifier
            </button>
            <button onClick={supprimer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition text-sm">
              <Trash2 size={15} /> Supprimer
            </button>
            <button onClick={telechargerPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm">
              <Download size={15} /> Télécharger PDF
            </button>
            <button onClick={documentSuivant}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm">
              Document suivant <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200" style={{ height: "80vh" }}>
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <DevisPDF {...devisProps} />
          </PDFViewer>
        </div>
      </div>
    )
  }

  // ===== FORMULAIRE =====
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nouveau devis</h1>
            <p className="text-gray-500 text-sm">Étape 1/4 — Vente indirecte</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard/documents")}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
          Documents <ArrowRight size={16} />
        </button>
      </div>

      {/* Barre de progression */}
      <div className="flex items-center gap-2">
        {["Devis", "Bon de commande", "Bordereau", "Facture"].map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i === 0 ? "text-blue-700" : "text-gray-300"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-400"
              }`}>{i + 1}</div>
              <span className="text-xs font-semibold hidden sm:block">{step}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 ${i === 0 ? "bg-blue-200" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-6">

        {/* Références */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Numéro de devis</label>
            <input value={numeroDevis} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Date d'émission</label>
            <input value={dateDevis} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Valide jusqu'au</label>
            <input value={dateValidite} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
        </div>

        {/* Informations client */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Identification du client</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div className="md:col-span-2">
              <ClientSelector onSelect={(c) => setClient({ ...client, nom: c.nom, adresse: c.adresse, telephone: c.telephone })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Nom / Raison sociale *</label>
              <input type="text" required placeholder="Ex: Jean Dupont ou SARL ABC" value={client.nom}
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
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">IFU / NIU client</label>
              <input type="text" placeholder="Ex: M123456789" value={client.ifu}
                onChange={(e) => setClient({ ...client, ifu: e.target.value })}
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
        </div>

        {/* Articles */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Descriptif quantitatif et estimatif</h2>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Désignation</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Catégorie</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Qté</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">PU HT</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Total HT</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne) => (
                  <tr key={ligne.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <input type="text" placeholder="Description précise" value={ligne.designation}
                        onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" placeholder="Ex: Fourniture" value={ligne.categorie}
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
                <input type="text" placeholder="Désignation" value={ligne.designation}
                  onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                  className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Quantité</label>
                    <input type="number" min={1} value={ligne.quantite}
                      onChange={(e) => updateLigne(ligne.id, "quantite", Number(e.target.value))}
                      className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">PU HT</label>
                    <input type="number" min={0} value={ligne.prixUnitaire}
                      onChange={(e) => updateLigne(ligne.id, "prixUnitaire", Number(e.target.value))}
                      className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Total HT</span>
                  <span className="font-bold text-blue-700">{ligne.total.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={ajouterLigne} className="mt-3 flex items-center gap-2 text-blue-700 text-sm font-semibold hover:underline">
            <Plus size={16} /> Ajouter un article
          </button>
        </div>

        {/* Résumé financier */}
        <div className="flex flex-col items-end gap-2">
          <h2 className="text-base font-bold text-gray-800 w-full">Résumé financier</h2>
          <div className="bg-slate-50 rounded-xl p-4 w-full md:w-96 flex flex-col gap-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total HT</span>
              <span>{sousTotal.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 flex-1">Remise (%)</span>
              <input type="number" min={0} max={100} value={remise}
                onChange={(e) => setRemise(Number(e.target.value))}
                className="w-20 border border-gray-200 bg-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right" />
              <span className="text-sm text-red-500 w-28 text-right">- {montantRemise.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
              <span>Total HT après remise</span>
              <span className="font-semibold">{totalHT.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 flex-1">TVA (%)</span>
              <input type="number" min={0} max={100} step={0.01} value={tva}
                onChange={(e) => setTva(Number(e.target.value))}
                className="w-20 border border-gray-200 bg-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right" />
              <span className="text-sm text-gray-600 w-28 text-right">{montantTva.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
              <span>Total TTC</span>
              <span>{totalTTC.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 italic">
              Arrêté à la somme de : <strong>{totalEnLettres}</strong>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Mode de paiement</label>
            <select value={modePaiement} onChange={(e) => setModePaiement(e.target.value)}
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option>Virement</option>
              <option>Espèces</option>
              <option>Mobile Money</option>
              <option>Chèque</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Délais d'exécution / livraison</label>
            <input type="text" placeholder="Ex: 7 jours ouvrables" value={delaisLivraison}
              onChange={(e) => setDelaisLivraison(e.target.value)}
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-semibold text-gray-600">Conditions de règlement</label>
            <textarea rows={2} value={conditionsReglement}
              onChange={(e) => setConditionsReglement(e.target.value)}
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-600">Signature vendeur</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-end justify-center pb-3">
              <p className="text-xs text-gray-300">Signature et cachet</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Nom : ___________________________</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-600">Signature client — "Bon pour accord"</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-end justify-center pb-3">
              <p className="text-xs text-gray-300">Lu et approuvé — Signature et cachet</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Nom : ___________________________</p>
          </div>
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