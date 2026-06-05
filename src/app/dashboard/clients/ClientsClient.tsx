"use client"

import { useState } from "react"
import { Users, Plus, X, Trash2, Phone, Mail, MapPin } from "lucide-react"
import { saveClientAction, deleteClientAction } from "./actions"

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  createdAt: Date
}

export default function ClientsClient({ clients }: { clients: Client[] }) {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData(e.currentTarget)
    const result = await saveClientAction(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setShowForm(false)
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  async function handleDelete(clientId: string) {
    if (!confirm("Supprimer ce client ?")) return
    await deleteClientAction(clientId)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          <p className="text-gray-600 text-sm mt-1">Gérez vos clients enregistrés</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition"
        >
          <Plus size={18} />
          Nouveau client
        </button>
      </div>

      {/* Card stats */}
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full md:w-1/3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Users size={22} className="text-blue-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Clients enregistrés</p>
            <p className="text-2xl font-bold text-blue-700">{clients.length}</p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Nouveau client</h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Nom complet *</label>
              <input type="text" name="name" required placeholder="Ex: Jean Dupont"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Téléphone</label>
              <input type="text" name="phone" placeholder="Ex: +237 6XXXXXXXX"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">E-mail</label>
              <input type="email" name="email" placeholder="Ex: jean@email.com"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Adresse</label>
              <input type="text" name="address" placeholder="Ex: Yaoundé, Cameroun"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm disabled:opacity-50">
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recherche de contact*/}
      <div className="relative  rounded-lg mx-4 my-4 flex">
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-3 mx-4 border border-gray-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Liste clients */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">Liste des clients</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="text-xl">
              {search ? "Aucun client trouvé" : "Aucun client enregistré pour le moment"}
            </p>
            {!search && (
              <button onClick={() => setShowForm(true)} className="mt-4 text-blue-700 text-sm font-semibold hover:underline">
                Ajouter votre premier client
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((client) => (
              <div key={client.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full w-10 h-15 flex items-center justify-center font-bold text-blue-700">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{client.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {client.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Phone size={11} /> {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Mail size={11} /> {client.email}
                        </span>
                      )}
                      {client.address && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={11} /> {client.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}