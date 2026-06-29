"use client"

import { useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

interface Facture {
  totalAmount: number
  status: string
  createdAt: string
}

export default function DashboardCharts({ factures }: { factures: Facture[] }) {
  const dataMensuelle = useMemo(() => {
    const map: Record<string, number> = {}
    factures.forEach((f) => {
      const mois = MOIS[new Date(f.createdAt).getMonth()]
      map[mois] = (map[mois] || 0) + f.totalAmount
    })
    return MOIS.map((m) => ({ mois: m, montant: map[m] || 0 }))
  }, [factures])

  const dataPie = [
    { name: "Payées", value: factures.filter(f => f.status === "PAID").length },
    { name: "Impayées", value: factures.filter(f => f.status !== "PAID").length },
  ]

  if (factures.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Graphique mensuel */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Chiffre d'affaires mensuel</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataMensuelle}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString("fr-FR")} FCFA`, "Montant"]} />
            <Bar dataKey="montant" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Statut des factures</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={dataPie}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}              labelLine={false}
            >
              <Cell fill="#16a34a" />
              <Cell fill="#dc2626" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}