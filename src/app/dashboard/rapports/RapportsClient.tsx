"use client"

import { useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import { TrendingUp, CheckCircle, XCircle, Users, FileText, Download } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function formatNombre(n: number): string {
  return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

interface Facture {
  id: string
  number: string
  status: string
  totalAmount: number
  createdAt: string
  client: { name: string }
}

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

export default function RapportsClient({ factures }: { factures: Facture[] }) {
  const [periode, setPeriode] = useState<"semaine" | "mois" | "annee">("mois")

  const stats = useMemo(() => {
    const total = factures.reduce((acc, f) => acc + f.totalAmount, 0)
    const payees = factures.filter((f) => f.status === "PAID")
    const impayes = factures.filter((f) => f.status !== "PAID")
    const totalPayees = payees.reduce((acc, f) => acc + f.totalAmount, 0)
    const totalImpayes = impayes.reduce((acc, f) => acc + f.totalAmount, 0)
    return { total, payees: payees.length, impayes: impayes.length, totalPayees, totalImpayes }
  }, [factures])

  const dataMensuelle = useMemo(() => {
    const map: Record<string, number> = {}
    factures.forEach((f) => {
      const mois = new Date(f.createdAt).getMonth()
      const label = MOIS[mois]
      map[label] = (map[label] || 0) + f.totalAmount
    })
    return MOIS.map((m) => ({ mois: m, montant: map[m] || 0 }))
  }, [factures])

  const dataPie = [
    { name: "Payées", value: stats.payees },
    { name: "Impayées", value: stats.impayes },
  ]

  const topClients = useMemo(() => {
    const map: Record<string, number> = {}
    factures.forEach((f) => {
      map[f.client.name] = (map[f.client.name] || 0) + f.totalAmount
    })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, montant]) => ({ name, montant }))
  }, [factures])

  function telechargerRapportPDF() {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(29, 78, 216)
    doc.text("RAPPORT D'ACTIVITÉ", 105, 20, { align: "center" })
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 105, 28, { align: "center" })
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text("Résumé financier", 14, 40)

    autoTable(doc, {
      startY: 45,
      head: [["Indicateur", "Valeur"]],
      body: [
        ["Chiffre d'affaires total", `${formatNombre(stats.total)} FCFA`],
        ["Montant encaissé", `${formatNombre(stats.totalPayees)} FCFA`],
        ["Montant à encaisser", `${formatNombre(stats.totalImpayes)} FCFA`],
        ["Nombre de factures", `${factures.length}`],
        ["Factures payées", `${stats.payees}`],
        ["Factures impayées", `${stats.impayes}`],
      ],
      headStyles: { fillColor: [29, 78, 216] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
    })

    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text("Top clients", 14, finalY)
    autoTable(doc, {
      startY: finalY + 5,
      head: [["Client", "Montant total"]],
      body: topClients.map((c) => [c.name, `${formatNombre(c.montant)} FCFA`]),
      headStyles: { fillColor: [29, 78, 216] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
    })

    const finalY2 = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text("Liste des factures", 14, finalY2)
    autoTable(doc, {
      startY: finalY2 + 5,
      head: [["Numéro", "Client", "Montant", "Statut", "Date"]],
      body: factures.map((f) => [
        f.number,
        f.client.name,
        `${formatNombre(f.totalAmount)} FCFA`,
        f.status === "PAID" ? "Payée" : f.status === "OVERDUE" ? "En retard" : "Impayée",
        new Date(f.createdAt).toLocaleDateString("fr-FR"),
      ]),
      headStyles: { fillColor: [29, 78, 216] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
    })

    doc.save(`rapport-activite-${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.pdf`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Rapports d'activité</h1>
          <p className="text-gray-500 text-sm mt-1">Analyse de votre activité comptable</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={telechargerRapportPDF}
            className="flex items-center gap-2 bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition"
          >
            <Download size={15} />
            Télécharger
          </button>
          <div className="flex gap-1">
            {["semaine", "mois", "annee"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  periode === p ? "bg-blue-700 text-white" : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                {p === "semaine" ? "Sem." : p === "mois" ? "Mois" : "Année"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <TrendingUp size={14} className="text-blue-700" />
            </div>
            <p className="text-xs text-gray-500">Chiffre d'affaires</p>
          </div>
          <p className="text-base font-bold text-blue-700 truncate">{formatNombre(stats.total)} F</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-green-100 p-1.5 rounded-lg">
              <CheckCircle size={14} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-500">Encaissé</p>
          </div>
          <p className="text-base font-bold text-green-600 truncate">{formatNombre(stats.totalPayees)} F</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-red-100 p-1.5 rounded-lg">
              <XCircle size={14} className="text-red-500" />
            </div>
            <p className="text-xs text-gray-500">À encaisser</p>
          </div>
          <p className="text-base font-bold text-red-500 truncate">{formatNombre(stats.totalImpayes)} F</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <FileText size={14} className="text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">Total factures</p>
          </div>
          <p className="text-base font-bold text-purple-600">{factures.length}</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-sm md:text-base">Chiffre d'affaires mensuel</h2>
          {factures.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataMensuelle} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString("fr-FR")} FCFA`, "Montant"]} />
                <Bar dataKey="montant" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-sm md:text-base">Statut des factures</h2>
          {factures.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top clients */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-blue-700" />
          <h2 className="font-bold text-gray-800">Top clients</h2>
        </div>
        {topClients.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-400 text-sm">Aucune donnée</div>
        ) : (
          <div className="flex flex-col gap-3">
            {topClients.map((client, index) => (
              <div key={client.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800 truncate">{client.name}</span>
                    <span className="text-sm font-bold text-blue-700 ml-2 whitespace-nowrap">{formatNombre(client.montant)} F</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-700 h-1.5 rounded-full"
                      style={{ width: `${(client.montant / topClients[0].montant) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}