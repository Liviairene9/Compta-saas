"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowLeft, Download, ArrowRight, Save, Pencil } from "lucide-react"
import { useSession } from "next-auth/react"
import BordereauLivraisonPDF from "@/components/pdf/BordereauPDF"
import ClientSelector from "@/components/ClientSelector"
import { saveBordereauAction, deleteBordereauAction } from "./actions"
import { pdf } from "@react-pdf/renderer"
import dynamic from "next/dynamic"

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
)


interface LigneArticle {
  id: number
  designation: string
  categorie: string
  quantite: number
}

export default function BordereauLivraisonPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const today = new Date()
  const livraisonPrevue = new Date(today)
  livraisonPrevue.setDate(livraisonPrevue.getDate() + 7)
  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const [etape, setEtape] = useState<"formulaire" | "apercu">("formulaire")
  const [bordereauId, setBordereauId] = useState<string | null>(null)

  // Infos client
  const [client, setClient] = useState({ nom: "", adresse: "", telephone: "", ifu: "" })

  // Refs document
  const [numeroBordereau] = useState(`BL-${Date.now().toString().slice(-6)}`)
  const [dateBordereau] = useState(formatDate(today))
  const [dateLivraison, setDateLivraison] = useState(formatDate(livraisonPrevue))
  const [adresseLivraison, setAdresseLivraison] = useState("")

  // Articles (Uniquement Désignation, Catégorie et Quantité)
  const [lignes, setLignes] = useState<LigneArticle[]>([
    { id: 1, designation: "", categorie: "", quantite: 1 },
  ])

  // Conditions logistiques / Observations
  const [observations, setObservations] = useState("")

  const [vendeurInfo, setVendeurInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("bon-commande-data")
    if (data) {
      const parsed = JSON.parse(data)
      setClient(parsed.client || { nom: "", adresse: "", telephone: "", ifu: "" })
      // On filtre pour ne prendre que ce qui est nécessaire au BL
      if (parsed.lignes) {
        setLignes(parsed.lignes.map((l: any) => ({
          id: l.id || Date.now(),
          designation: l.designation || "",
          categorie: l.categorie || "",
          quantite: l.quantite || 1
        })))
      }
      if (parsed.client?.adresse) setAdresseLivraison(parsed.client.adresse)
    }

    async function fetchVendeur() {
      const res = await fetch("/api/compte")
      const data = await res.json()
      setVendeurInfo(data)
    }
    fetchVendeur()
  }, [])

  function updateLigne(id: number, field: keyof LigneArticle, value: string | number) {
    setLignes((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const safeValue = field === "quantite" ? (Number(value) || 0) : value
        return { ...l, [field]: safeValue }
      })
    )
  }

  function ajouterLigne() {
    setLignes((prev) => [
      ...prev,
      { id: Date.now(), designation: "", categorie: "", quantite: 1 },
    ])
  }

  function supprimerLigne(id: number) {
    if (lignes.length === 1) return
    setLignes((prev) => prev.filter((l) => l.id !== id))
  }
  const bordereauProps = {
  numeroBordereau,
  dateBordereau,
  dateLivraison,
  adresseLivraison: adresseLivraison || "",
  client,
  vendeur: {
    nom: session?.user?.name ?? "Mon Entreprise",
    telephone: session?.user?.phone ?? "",
    email: session?.user?.email ?? "",
    raisonSociale: vendeurInfo?.raisonSociale ?? "",
    adresse: vendeurInfo?.adresse ?? "",
    ville: vendeurInfo?.ville ?? "",
    pays: vendeurInfo?.pays ?? "",
    numeroRCCM: vendeurInfo?.numeroRCCM ?? "",
    numeroContribuable: vendeurInfo?.numeroContribuable ?? "",
    numeroTVA: vendeurInfo?.numeroTVA ?? "",
  },
  lignes,
  observations: observations || "",
}

  async function enregistrer() {
  if (!client.nom) { alert("Veuillez renseigner le nom du client"); return }
  setLoading(true)
  try {
    const result = await saveBordereauAction({
      numeroBordereau,
      clientNom: client.nom,
      clientAdresse: client.adresse,
      clientTelephone: client.telephone,
      clientIfu: client.ifu,
      dateLivraison,
      adresseLivraison,
      observations,
        lignes, 

    })
    if ((result as any)?.id) {
      setBordereauId((result as any).id)
      setEtape("apercu")
    } else {
      alert((result as any)?.error || "Erreur lors de la sauvegarde")
    }
  } catch (err) {
    alert("Une erreur est survenue")
  } finally {
    setLoading(false)
  }
}

  async function telechargerPDF() {
    const blob = await pdf(<BordereauLivraisonPDF {...bordereauProps} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${numeroBordereau}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function supprimer() {
    if (!bordereauId) return
    if (!confirm("Supprimer ce bordereau de livraison définitivement ?")) return
    await deleteBordereauAction(bordereauId as any)
    router.push("/dashboard/documents")
  }

  function documentSuivant() {
    localStorage.setItem("bordereau-data", JSON.stringify({
      client, lignes, dateLivraison, adresseLivraison
    }))
    router.push("/dashboard/documents/facture")
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
              <h1 className="text-2xl font-bold text-gray-800">{numeroBordereau}</h1>
              <p className="text-green-600 text-sm font-semibold">✅ Bordereau de livraison enregistré</p>
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
              Établir la Facture <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div style={{ width: "100%", height: "80vh", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
  <PDFViewer style={{ width: "100%", height: "100%" }} showToolbar={false}>
    <BordereauLivraisonPDF {...bordereauProps} />
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
            <h1 className="text-2xl font-bold text-gray-800">Nouveau bordereau de livraison</h1>
            <p className="text-gray-500 text-sm">Étape 3/4 — Logistique et Livraison (Normes OHADA)</p>
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
            <div className={`flex items-center gap-2 ${i <= 2 ? "text-blue-700" : "text-gray-300"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i < 2 ? "bg-green-500 text-white" : i === 2 ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-400"
              }`}>{i < 2 ? "✓" : i + 1}</div>
              <span className="text-xs font-semibold hidden sm:block">{step}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 ${i < 2 ? "bg-green-300" : i === 2 ? "bg-blue-200" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-6">

        {/* Références du Bordereau */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Numéro du bordereau</label>
            <input value={numeroBordereau} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Date d'édition</label>
            <input value={dateBordereau} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Date de livraison prévue</label>
            <input type="date" value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)}
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>

        {/* Informations client & Livraison */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Identification du destinataire & Livraison</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div className="md:col-span-2">
              <ClientSelector onSelect={(c) => {
                setClient({ ...client, nom: c.nom, adresse: c.adresse, telephone: c.telephone });
                if (!adresseLivraison) setAdresseLivraison(c.adresse);
              }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Nom / Raison sociale *</label>
              <input type="text" required placeholder="Nom du destinataire" value={client.nom}
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

        {/* Liste des articles livrés */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Désignation des marchandises</h2>

          {/* Table Bureau */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Désignation</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold">Catégorie</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold w-32">Quantité</th>
                  <th className="px-3 py-3 w-12" />
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
                        className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </td>
                    <td className="px-3 py-2 text-center">
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
                    <label className="text-xs font-semibold text-gray-500">Catégorie</label>
                    <input type="text" placeholder="Catégorie" value={ligne.categorie}
                      onChange={(e) => updateLigne(ligne.id, "categorie", e.target.value)}
                      className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Quantité</label>
                    <input type="number" min={1} value={ligne.quantite}
                      onChange={(e) => updateLigne(ligne.id, "quantite", e.target.value)}
                      className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={ajouterLigne} className="mt-3 flex items-center gap-2 text-blue-700 text-sm font-semibold hover:underline">
            <Plus size={16} /> Ajouter un article
          </button>
        </div>

        {/* Observations / Réserves à la livraison */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Observations / Réserves de transport</label>
          <textarea rows={3} placeholder="Ex: Marchandises fragiles, instructions particulières de déchargement, ou état des colis constaté à la livraison..." 
            value={observations} onChange={(e) => setObservations(e.target.value)}
            className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
        </div>

        {/* Validation et Mandats Juridiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-600">Pour le Livreur / Expéditeur</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-end justify-center pb-3">
              <p className="text-xs text-gray-300">Signature & Cachet commercial</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Nom Responsable : ___________________________</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-600">Pour le Réceptionnaire — "Bon pour accord de réception"</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-end justify-center pb-3">
              <p className="text-xs text-gray-300">Date, Signature & Cachet du client</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Nom Réceptionnaire : ___________________________</p>
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
            {loading ? "Enregistrement..." : "Enregistrer le BL"}
          </button>
        </div>
      </div>
    </div>
  )
}