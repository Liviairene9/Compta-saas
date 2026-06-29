"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowLeft, Download, ArrowRight, Save, Pencil } from "lucide-react"
import { pdf, PDFViewer } from "@react-pdf/renderer"
import { useSession } from "next-auth/react"
import BonCommandePDF from "@/components/pdf/BonCommandePDF"
import ClientSelector from "@/components/ClientSelector"
import { saveBonCommandeAction, deleteBonCommandeAction } from "./actions"

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
    if (Math.floor(n / 100) === 1) result += "mille "
    else result += nombreEnLettres(Math.floor(n / 100)) + " mille "
    n %= 100
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

export default function BonCommandePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const today = new Date()
  const livraisonPrevue = new Date(today)
  livraisonPrevue.setDate(livraisonPrevue.getDate() + 7)
  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const [etape, setEtape] = useState<"formulaire" | "apercu">("formulaire")
  const [bonCommandeId, setBonCommandeId] = useState<string | null>(null)

  // Infos client
  const [client, setClient] = useState({ nom: "", adresse: "", telephone: "", ifu: "" })

  // Refs document
  const [numeroBon] = useState(`BC-${Date.now().toString().slice(-6)}`)
  const [dateBon] = useState(formatDate(today))
  const [dateLivraison, setDateLivraison] = useState(formatDate(livraisonPrevue))
  const [adresseLivraison, setAdresseLivraison] = useState("")

  // Articles
  const [lignes, setLignes] = useState<LigneArticle[]>([
    { id: 1, designation: "", categorie: "", quantite: 1, prixUnitaire: 0, total: 0 },
  ])

  // Financier & Conditions
  const [remise, setRemise] = useState(0)
  const [tva, setTva] = useState(19.25)
  const [modePaiement, setModePaiement] = useState("Virement")
  const [conditionsReglement, setConditionsReglement] = useState("À la livraison")

  const [vendeurInfo, setVendeurInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("devis-data")
    if (data) {
      const parsed = JSON.parse(data)
      setClient(parsed.client || { nom: "", adresse: "", telephone: "", ifu: "" })
      if (parsed.lignes) setLignes(parsed.lignes)
      if (parsed.tva) setTva(parsed.tva)
      if (parsed.remise) setRemise(parsed.remise)
      if (parsed.modePaiement) setModePaiement(parsed.modePaiement)
      if (parsed.client?.adresse) setAdresseLivraison(parsed.client.adresse)
    }

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
        const safeValue = (field === "quantite" || field === "prixUnitaire") ? (Number(value) || 0) : value
        const updated = { ...l, [field]: safeValue }
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

  const bonCommandeProps = {
    numeroBon,
    dateBon,
    dateLivraison,
    adresseLivraison,
    client: {
      nom : client.nom,
      adresse: client.adresse,
      telephone: client.telephone,
    ifu: client.ifu, // Ton client.ifu est bien là
    },
    clientNom: client.nom,         // C'est ici que tu avais tes lignes :
  clientAdresse: client.adresse, // clientAdresse: client.adresse,
  clientTelephone: client.telephone,
  clientIfu: client.ifu,         // <-- La ligne qui bloquait à cause du type
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
    sousTotal,
    totalHT,
    montantTva,
    totalTTC,
    totalEnLettres,
  }

  async function enregistrer() {
    if (!client.nom) { alert("Veuillez renseigner le nom du client"); return }
    setLoading(true)
    const result = await saveBonCommandeAction({
      numeroBon,
      clientNom: client.nom,
      clientAdresse: client.adresse,
      clientTelephone: client.telephone,
      totalTTC,
      dateLivraison, 
      adresseLivraison,
      remise,
      conditionsReglement,
      modePaiement,
        lignes, 

    } as any )
    if ((result as any)?.id) setBonCommandeId((result as any).id)
    setLoading(false)
    setEtape("apercu")
  }

  async function telechargerPDF() {
    const blob = await pdf(<BonCommandePDF {...bonCommandeProps} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${numeroBon}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function supprimer() {
    if (!bonCommandeId) return
    if (!confirm("Supprimer ce bon de commande définitivement ?")) return
    await deleteBonCommandeAction(bonCommandeId)
    router.push("/dashboard/documents")
  }

  function documentSuivant() {
    localStorage.setItem("bon-commande-data", JSON.stringify({
      client, lignes, tva, remise, modePaiement, dateLivraison, adresseLivraison, sousTotal, totalHT, montantTva, totalTTC
    }))
    router.push("/dashboard/documents/bordereau")
  }

  // ===== APERCU (Boutons : Modifier, Supprimer, Télécharger PDF, Suivant) =====
  if (etape === "apercu") {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setEtape("formulaire")} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{numeroBon}</h1>
              <p className="text-green-600 text-sm font-semibold">✅ Bon de commande enregistré avec succès</p>
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
              Bordereau de livraison <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200" style={{ height: "80vh" }}>
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <BonCommandePDF {...bonCommandeProps} />
          </PDFViewer>
        </div>
      </div>
    )
  }

  // ===== FORMULAIRE (Boutons : Annuler, Enregistrer et Prévisualiser) =====
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nouveau bon de commande</h1>
            <p className="text-gray-500 text-sm">Étape 2/4 — Vente indirecte (Normes OHADA)</p>
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
            <div className={`flex items-center gap-2 ${i <= 1 ? "text-blue-700" : "text-gray-300"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i < 1 ? "bg-green-500 text-white" : i === 1 ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-400"
              }`}>{i < 1 ? "✓" : i + 1}</div>
              <span className="text-xs font-semibold hidden sm:block">{step}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 ${i < 1 ? "bg-green-300" : i === 1 ? "bg-blue-200" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-6">

        {/* Références du Bon de commande */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Numéro du bon</label>
            <input value={numeroBon} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Date de commande</label>
            <input value={dateBon} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Date de livraison prévue</label>
            <input type="date" value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)}
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>

        {/* Informations client & Livraison */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Identification du client & Livraison</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div className="md:col-span-2">
              <ClientSelector onSelect={(c) => {
                setClient({ ...client, nom: c.nom, adresse: c.adresse, telephone: c.telephone });
                if (!adresseLivraison) setAdresseLivraison(c.adresse);
              }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Nom / Raison sociale *</label>
              <input type="text" required placeholder="Nom du donneur d'ordre" value={client.nom}
                onChange={(e) => setClient({ ...client, nom: e.target.value })}
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Téléphone</label>
              <input type="text" placeholder="Ex: +237 6XXXXXXXX" value={client.telephone}
                onChange={(e) => setClient({ ...client, telephone: e.target.value })}
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Adresse de facturation</label>
              <input type="text" placeholder="Siège social client" value={client.adresse}
                onChange={(e) => setClient({ ...client, adresse: e.target.value })}
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">IFU / NIU client</label>
              <input type="text" placeholder="Ex: M123456789" value={client.ifu}
                onChange={(e) => setClient({ ...client, ifu: e.target.value })}
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-600">Adresse de livraison effective *</label>
              <input type="text" placeholder="Lieu exact de déchargement de la marchandise" value={adresseLivraison}
                onChange={(e) => setAdresseLivraison(e.target.value)}
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
        </div>

        {/* Liste des articles commandés */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Désignation des marchandises ou prestations</h2>

          {/* Table de bureau */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Désignation</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Catégorie</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Quantité</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Prix Unit. HT</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Total HT</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne) => (
                  <tr key={ligne.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <input type="text" placeholder="Description article" value={ligne.designation}
                        onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" placeholder="Catégorie" value={ligne.categorie}
                        onChange={(e) => updateLigne(ligne.id, "categorie", e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={1} value={ligne.quantite === 0 ? "" : ligne.quantite}
                        onChange={(e) => updateLigne(ligne.id, "quantite", e.target.value)}
                        className="w-20 border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} value={ligne.prixUnitaire === 0 ? "" : ligne.prixUnitaire}
                        onChange={(e) => updateLigne(ligne.id, "prixUnitaire", e.target.value)}
                        className="w-28 border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-800">
                      {ligne.total.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => supprimerLigne(ligne.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition" disabled={lignes.length === 1}>
                        <Trash2 size={14} className={lignes.length === 1 ? "text-gray-300" : "text-red-400"} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {lignes.map((ligne, index) => (
              <div key={ligne.id} className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-600">Article {index + 1}</span>
                  <button onClick={() => supprimerLigne(ligne.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition" disabled={lignes.length === 1}>
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
                      onChange={(e) => updateLigne(ligne.id, "quantite", e.target.value)}
                      className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Prix Unit. HT</label>
                    <input type="number" min={0} value={ligne.prixUnitaire}
                      onChange={(e) => updateLigne(ligne.id, "prixUnitaire", e.target.value)}
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

        {/* Résumé financier (Totaux) */}
        <div className="flex flex-col items-end gap-2">
          <h2 className="text-base font-bold text-gray-800 w-full">Décompte financier</h2>
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
              <span>Total HT Net</span>
              <span className="font-semibold">{totalHT.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 flex-1">TVA (%)</span>
              <input type="number" min={0} max={100} step={0.01} value={tva}
                onChange={(e) => setTva(Number(e.target.value))}
                className="w-20 border border-gray-200 bg-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right" />
              <span className="text-sm text-gray-600 w-28 text-right">{montantTva.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between font-bold text-blue-900 border-t pt-2 text-base">
              <span>Net à payer (TTC)</span>
              <span>{totalTTC.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 italic">
              Arrêté à la somme de : <strong>{totalEnLettres}</strong>
            </div>
          </div>
        </div>

        {/* Modalités Commerciales de Commande */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Mode de règlement convenu</label>
            <select value={modePaiement} onChange={(e) => setModePaiement(e.target.value)}
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option>Virement</option>
              <option>Espèces</option>
              <option>Mobile Money</option>
              <option>Chèque</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Conditions d'exécution et de règlement</label>
            <input type="text" placeholder="Ex: À la livraison ou 50% d'acompte" value={conditionsReglement}
              onChange={(e) => setConditionsReglement(e.target.value)}
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>

        {/* Validation et Mandats Juridiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-600">Pour le Fournisseur (Acceptation)</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-end justify-center pb-3">
              <p className="text-xs text-gray-300">Signature & Cachet commercial</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Nom Responsable : ___________________________</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-600">Pour l'Acheteur — "Bon pour commande"</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-end justify-center pb-3">
              <p className="text-xs text-gray-300">Date, Signature & Cachet de l'acheteur</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Nom Donneur d'ordre : ___________________________</p>
          </div>
        </div>

        {/* Actions du Formulaire */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm w-full sm:w-auto">
            Annuler
          </button>
          <button type="button" onClick={enregistrer} disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition text-sm w-full sm:w-auto disabled:opacity-50">
            <Save size={16} />
            {loading ? "Enregistrement..." : "Enregistrer "}
          </button>
        </div>
      </div>
    </div>
  )
}