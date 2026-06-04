"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowLeft, Download, ArrowRight } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import { useSession } from "next-auth/react"
import DevisPDF from "@/components/pdf/DevisPDF"

interface LigneArticle {
  id: number
  designation: string
  categorie: string
  quantite: number
  prixUnitaire: number
  total: number
}

export default function DevisPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const today = new Date()
  const validite = new Date(today)
  validite.setDate(validite.getDate() + 30)

  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const [client, setClient] = useState({ nom: "", adresse: "", telephone: "" })
  const [numeroDevis] = useState(`DEV-${Date.now().toString().slice(-6)}`)
  const [dateDevis] = useState(formatDate(today))
  const [dateValidite] = useState(formatDate(validite))
  const [tva, setTva] = useState(0)
  const [modePaiement, setModePaiement] = useState("Virement")
  const [telecharge, setTelecharge] = useState(false)
  const [lignes, setLignes] = useState<LigneArticle[]>([
    { id: 1, designation: "", categorie: "", quantite: 1, prixUnitaire: 0, total: 0 },
  ])

  const sousTotal = lignes.reduce((acc, l) => acc + l.total, 0)
  const montantTva = (sousTotal * tva) / 100
  const totalTTC = sousTotal + montantTva

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

  async function telechargerPDF() {
    const blob = await pdf(
      <DevisPDF
        numeroDevis={numeroDevis}
        dateDevis={dateDevis}
        dateValidite={dateValidite}
        client={client}
        vendeur={{
          nom: session?.user?.name ?? "Mon Entreprise",
          telephone: session?.user?.phone ?? "",
          email: session?.user?.email ?? "",
        }}
        lignes={lignes}
        tva={tva}
        modePaiement={modePaiement}
        sousTotal={sousTotal}
        montantTva={montantTva}
        totalTTC={totalTTC}
      />
    ).toBlob()

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${numeroDevis}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setTelecharge(true)
  }

  function documentSuivant() {
    // Passe les données au bon de commande via localStorage
    localStorage.setItem("devis-data", JSON.stringify({
      client, lignes, tva, modePaiement, sousTotal, montantTva, totalTTC
    }))
    router.push("/dashboard/documents/bon-commande")
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nouveau devis</h1>
          <p className="text-gray-500 text-sm">Étape 1/4 — Vente indirecte</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="flex items-center gap-2">
        {["Devis", "Bon de commande", "Bordereau", "Facture"].map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i === 0 ? "text-blue-700" : "text-gray-300"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block">{step}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 ${i === 0 ? "bg-blue-200" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-6">

        {/* Numéro + dates */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Numéro de devis</label>
            <input value={numeroDevis} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Date du devis</label>
            <input value={dateDevis} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Valide jusqu'au</label>
            <input value={dateValidite} readOnly className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-500 outline-none" />
          </div>
        </div>

        {/* Informations client */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Informations client</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
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

          {/* Desktop */}
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
                  <input type="text" placeholder="Ex: Paquet de chips" value={ligne.designation}
                    onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                    className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500">Catégorie</label>
                  <input type="text" placeholder="Ex: Alimentaire" value={ligne.categorie}
                    onChange={(e) => updateLigne(ligne.id, "categorie", e.target.value)}
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
          <button type="button" onClick={telechargerPDF}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm w-full sm:w-auto">
            <Download size={16} />
            Télécharger PDF
          </button>
          {telecharge && (
            <button type="button" onClick={documentSuivant}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm w-full sm:w-auto">
              Document suivant
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}