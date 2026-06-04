"use client"

import { useState } from "react"
import { updateCompteAction } from "@/app/dashboard/compte/actions"
import { Building2, MapPin, FileText, Phone, Mail, Save } from "lucide-react"

interface User {
  id: string
  name: string
  email: string | null
  phone: string
  raisonSociale: string | null
  adresse: string | null
  ville: string | null
  pays: string | null
  numeroRCCM: string | null
  numeroContribuable: string | null
  numeroTVA: string | null
  cgv: string | null
}


export default function CompteClient({ user }: { user: User }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")
    const formData = new FormData(e.currentTarget)
    const result = await updateCompteAction(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mon compte</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ces informations apparaîtront sur vos documents PDF
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-semibold">
          ✅ Informations mises à jour avec succès
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Infos de connexion */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={18} className="text-blue-700" />
            <h2 className="font-bold text-gray-800">Informations de connexion</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Nom complet</label>
              <input
                name="name"
                type="text"
                defaultValue={user.name}
                required
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Téléphone</label>
              <input
                value={user.phone}
                readOnly
                className="border border-gray-200 bg-slate-50 p-3 rounded-xl text-sm text-gray-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-600">E-mail</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email ?? ""}
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Infos professionnelles */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={18} className="text-blue-700" />
            <h2 className="font-bold text-gray-800">Informations professionnelles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-600">Raison sociale *</label>
              <input
                name="raisonSociale"
                type="text"
                defaultValue={user.raisonSociale ?? ""}
                placeholder="Ex: Mon Entreprise SARL"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Numéro RCCM</label>
              <input
                name="numeroRCCM"
                type="text"
                defaultValue={user.numeroRCCM ?? ""}
                placeholder="Ex: RC/YAO/2024/B/1234"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Numéro contribuable</label>
              <input
                name="numeroContribuable"
                type="text"
                defaultValue={user.numeroContribuable ?? ""}
                placeholder="Ex: M123456789"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Numéro TVA</label>
              <input
                name="numeroTVA"
                type="text"
                defaultValue={user.numeroTVA ?? ""}
                placeholder="Ex: TVA-CM-123456"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-blue-700" />
            <h2 className="font-bold text-gray-800">Adresse</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-600">Adresse complète</label>
              <input
                name="adresse"
                type="text"
                defaultValue={user.adresse ?? ""}
                placeholder="Ex: Rue de la Paix, Quartier Bastos"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Ville</label>
              <input
                name="ville"
                type="text"
                defaultValue={user.ville ?? ""}
                placeholder="Ex: Yaoundé"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Pays</label>
              <input
                name="pays"
                type="text"
                defaultValue={user.pays ?? "Cameroun"}
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* CGV */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-blue-700" />
            <h2 className="font-bold text-gray-800">Conditions générales de vente</h2>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              CGV <span className="text-gray-400 font-normal">(apparaîtront en bas de vos documents)</span>
            </label>
            <textarea
              name="cgv"
              rows={4}
              defaultValue={user.cgv ?? ""}
              placeholder="Ex: Paiement à 30 jours. Tout retard de paiement entraîne des pénalités..."
              className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Bouton save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  )
}