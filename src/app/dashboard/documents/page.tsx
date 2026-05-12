"use client"

import {  Plus , X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const venteIndirecte = [
  { label: "Créer un devis", href: "/dashboard/documents/devis", color: "bg-blue-100 border-blue-200 text-blue-700" },
  { label: "Créer un bon de commande", href: "/dashboard/documents/bon-commande", color: "bg-slate-50 border-slate-200 text-slate-800" },
  { label: "Créer un bordereau de livraison", href: "/dashboard/documents/bordereau", color: "bg-slate-50 border-slate-200 text-slate-700" },
  { label: "Créer une facture", href: "/dashboard/documents/facture", color: "bg-white border-none text-blue-600" },
]

export default function DocumentsPage() {
    const [showForm, setShowForm] = useState(false);
  
  const router = useRouter()

  return (
    <div className="flex flex-col gap-8">
      {/* Premier titre*/}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
        <p className="text-gray-500 text-sm mt-1">Créez et gérez vos documents comptables</p>
      </div>

      {/* Onglet -  Vente directe */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-700">Vente directe</h2>
        <button
          onClick={() => router.push("/dashboard/documents/")}
          className=" bg-white border-4 border-dashed border-blue-300 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition group w-full"
        >
          <div onClick={() => setShowForm(true)}  className="bg-blue-700 p-4 rounded-full  transition">
            <Plus size={28} className="text-white" />
          </div>
          <p className="text-blue-700 font-semibold text-xl">Créer une facture</p>
          <p className="text-gray-400 text-xl">Facturation rapide sans étape intermédiaire</p>
        </button>
      </div>
            {showForm && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex  items-center justify-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">
                    Nouvelle facture 
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
                      Nom du client : 
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Ex: Mirabelle amy"
                      className="border border-gray-200 bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
      
                  <div className="flex flex-col gap-1">
                    <label className="text-lg font-semibold text-slate-800">
                      Désignation
                    </label>
                    <input
                      type="text"
                      name="désignation"
                      placeholder="Ex: paquet de chips"
                      className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
      
                  <div className="flex flex-col gap-1">
                    <label className="text-lg font-semibold text-slate-800">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      name="categorie"
                      placeholder="Ex: produit alimentaire"
                      className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
      
                  <div className="flex flex-col gap-1">
                    <label className="text-lg font-semibold text-slate-800">
                      Prix
                    </label>
                    <input
                      type="text"
                      name="prix"
                      placeholder="Ex: 100"
                      className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                     <div className="flex flex-col gap-1">
                    <label className="text-lg font-semibold text-slate-800">
                      Quantité
                    </label>
                    <input
                      type="number"
                      name="qty"
                      placeholder="Ex: 4"
                      className="border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                                       <div className="flex flex-col gap-1">
                    <label className="text-lg font-semibold text-slate-800">
                      Total TTC
                    </label>
                    <input
                      type=""
                      name="qty"
                      placeholder="Ex: 4"
                      className="border border-gray-200 bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>


      
                  <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm"
                    >
                      Exporter en PDF
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition text-sm"
                    >
                      Enregistrer un paiement
                    </button>
                  </div>
                </form>
              </div>
            )}
      

      {/* Onglet  - Vente indirecte */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-700">Vente indirecte</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {venteIndirecte.map(({ label, href, color }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`border-4 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:opacity-80 transition group w-full ${color}`}
            >
              <div className="bg-blue-700 p-3 rounded-full shadow-xl">
                <Plus size={24} className="text-white/90" />
              </div>
              <p className="font-semibold text-xl">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}