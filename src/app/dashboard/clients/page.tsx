"use client"

import { useState } from "react"
import { Users, Plus, X , Search } from "lucide-react"

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false)

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
          className="flex items-center gap-2 bg-blue-700 text-white mx-4 my-4 px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition whitespace-nowrap"
          >
          <Plus size={18} />
          Nouveau client
        </button>
      </div>
      <div className="flex justify-center bg-none rounded-lg gap-3">
        <Search size={20} />
     <input className="bg-white rounded-lg gap-3 flex shadow-xl p-6 w-full md:w-1/3" placeholder="Rechercher..." />
      </div>
      {/* Card stats */}
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full md:w-1/3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Users size={22} className="text-blue-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Clients enregistrés</p>
            <p className="text-2xl font-bold text-blue-700">0</p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              Nouveau client
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div className="flex flex-col gap-1">
              <label className="text-lg font-semibold text-slate-800">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ex: Jean Dupont"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-semibold text-slate-800">
                Téléphone
              </label>
              <input
                type="text"
                name="phone"
                placeholder="Ex: +237 6XXXXXXXX"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-semibold text-slate-800">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                placeholder="Ex: jean@email.com"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-semibold text-slate-800">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                placeholder="Ex: Yaoundé, Cameroun"
                className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste clients */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Liste des clients
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Users size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Aucun client enregistré pour le moment</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-700 text-sm font-semibold hover:underline"
          >
            Ajouter votre premier client
          </button>
        </div>
      </div>
    </div>
  )
}