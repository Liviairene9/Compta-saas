"use client"

import { useState } from "react"
import { Bell, Mail, MessageSquare, Phone, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import {
  envoyerRappelEmailAction,
  envoyerRappelSMSAction,
  envoyerRappelWhatsAppAction,
} from "./actions"

interface Facture {
  id: string
  number: string
  status: string
  totalAmount: number
  dueDate: string | null
  createdAt: string
  client: {
    name: string
    email: string | null
    phone: string | null
  }
}

export default function RappelsClient({ factures }: { factures: Facture[] }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, { type: "success" | "error" | "warning"; text: string }>>({})

  function isEnRetard(dueDate: string | null) {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  async function handleRappel(
    factureId: string,
    type: "email" | "sms" | "whatsapp"
  ) {
    setLoading(`${factureId}-${type}`)
    setMessages((prev) => ({ ...prev, [`${factureId}-${type}`]: { type: "success", text: "" } }))

    let result: any
    if (type === "email") result = await envoyerRappelEmailAction(factureId)
    else if (type === "sms") result = await envoyerRappelSMSAction(factureId)
    else result = await envoyerRappelWhatsAppAction(factureId)

    setMessages((prev) => ({
      ...prev,
      [`${factureId}-${type}`]: {
        type: result.error ? "error" : result.simule ? "warning" : "success",
        text: result.error || result.message || "",
      },
    }))
    setLoading(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-red-100 p-2 rounded-xl">
          <Bell size={20} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rappels d'impayés</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {factures.length} facture{factures.length > 1 ? "s" : ""} en attente de paiement
          </p>
        </div>
      </div>

      {factures.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center text-gray-400">
          <CheckCircle size={40} className="mb-3 text-green-400" />
          <p className="font-semibold text-green-600">Aucune facture impayée</p>
          <p className="text-sm mt-1">Toutes vos factures sont réglées</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {factures.map((facture) => {
            const enRetard = isEnRetard(facture.dueDate)
            return (
              <div key={facture.id} className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${
                enRetard ? "border-red-500" : "border-orange-400"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Infos facture */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700">{facture.number}</span>
                      {enRetard ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={11} /> En retard
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                          <Clock size={11} /> Impayée
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800">{facture.client.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {facture.client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {facture.client.phone}
                        </span>
                      )}
                      {facture.client.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {facture.client.email}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-800 mt-1">
                      {facture.totalAmount.toLocaleString("fr-FR")} FCFA
                    </p>
                    {facture.dueDate && (
                      <p className="text-xs text-gray-400">
                        Échéance : {new Date(facture.dueDate).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>

                  {/* Boutons rappel */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleRappel(facture.id, "email")}
                        disabled={loading === `${facture.id}-email` || !facture.client.email}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-40"
                      >
                        <Mail size={15} />
                        {loading === `${facture.id}-email` ? "Envoi..." : "Rappel par email"}
                      </button>
                      {!facture.client.email && (
                        <p className="text-xs text-gray-400 text-center">Email client non renseigné</p>
                      )}
                      {messages[`${facture.id}-email`]?.text && (
                        <p className={`text-xs text-center font-semibold ${
                          messages[`${facture.id}-email`].type === "error" ? "text-red-500" :
                          messages[`${facture.id}-email`].type === "warning" ? "text-orange-500" :
                          "text-green-600"
                        }`}>
                          {messages[`${facture.id}-email`].text}
                        </p>
                      )}
                    </div>

                    {/* SMS */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleRappel(facture.id, "sms")}
                        disabled={loading === `${facture.id}-sms` || !facture.client.phone}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-40"
                      >
                        <Phone size={15} />
                        {loading === `${facture.id}-sms` ? "Envoi..." : "Rappel par SMS"}
                      </button>
                      {!facture.client.phone && (
                        <p className="text-xs text-gray-400 text-center">Téléphone client non renseigné</p>
                      )}
                      {messages[`${facture.id}-sms`]?.text && (
                        <p className={`text-xs text-center font-semibold ${
                          messages[`${facture.id}-sms`].type === "warning" ? "text-orange-500" : "text-green-600"
                        }`}>
                          {messages[`${facture.id}-sms`].text}
                        </p>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleRappel(facture.id, "whatsapp")}
                        disabled={loading === `${facture.id}-whatsapp` || !facture.client.phone}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition disabled:opacity-40"
                      >
                        <MessageSquare size={15} />
                        {loading === `${facture.id}-whatsapp` ? "Envoi..." : "Rappel WhatsApp"}
                      </button>
                      {messages[`${facture.id}-whatsapp`]?.text && (
                        <p className={`text-xs text-center font-semibold ${
                          messages[`${facture.id}-whatsapp`].type === "warning" ? "text-orange-500" : "text-green-600"
                        }`}>
                          {messages[`${facture.id}-whatsapp`].text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}