import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FileText, Users, CheckCircle, XCircle, Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/auth")

  const ownerId = (session as any).user.id

  const [factures, totalClients, totalFactures, facturesPayees, facturesImpayes] = await Promise.all([
    prisma.invoice.findMany({
      where: { ownerId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.client.count({ where: { ownerId } }),
    prisma.invoice.count({ where: { ownerId } }),
    prisma.invoice.count({ where: { ownerId, status: "PAID" } }),
    prisma.invoice.count({ where: { ownerId, status: "UNPAID" } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, {session.user.name} 
          </h1>
          <p className="text-gray-500 text-sm mt-1">Voici un aperçu de votre activité</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/documents/facture-directe"
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition"
          >
            <Plus size={16} />
            Nouvelle facture
          </Link>
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
          >
            <Plus size={16} />
            Nouveau client
          </Link>
        </div>
      </div>

      {/* Cards stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5  flex items-center gap-3">
          <div className="bg-white p-3 rounded-full">
            <FileText size={20} className="text-blue-700" />
          </div>
          <div className='flex gap-4 mx-4 my-4'>
            <p className="text-lg text-gray-500">Total factures</p>
            <p className="text-2xl font-bold text-blue-700">{totalFactures}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5  flex items-center gap-3">
          <div className="bg-white p-3 rounded-xl">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div className='flex gap-4 mx-4 my-4'>
            <p className="text-lg text-gray-500">Payées</p>
            <p className="text-2xl font-bold text-green-600">{facturesPayees}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-3">
          <div className="bg-white p-3 rounded-xl">
            <XCircle size={20} className="text-red-500" />
          </div>
          <div className='flex gap-4 mx-4 my-4'>
            <p className="text-lg text-gray-500">Impayées</p>
            <p className="text-2xl font-bold text-red-500">{facturesImpayes}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5  flex items-center gap-3">
          <div className="bg-white p-3 rounded-xl">
            <Users size={20} className="text-purple-600" />
          </div>
          <div className='flex gap-4 mx-4 my-4'>
            <p className="text-lg text-gray-500">Clients</p>
            <p className="text-2xl font-bold text-purple-600">{totalClients}</p>
          </div>
        </div>
      </div>

      {/* Dernières factures */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Dernières factures</h2>
          <Link href="/dashboard/documents" className="text-blue-700 text-lg font-semibold hover:underline">
            Voir tout →
          </Link>
        </div>

        {factures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FileText size={36} className="mb-3 opacity-30" />
            <p className="text-sm">Aucune facture pour le moment</p>
            <Link href="/dashboard/documents" className="mt-3 text-blue-700 text-sm font-semibold hover:underline">
              Créer votre première facture
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto"> 
            <table className="w-full text-lg">
              <thead>
                <tr className="border-b ">
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Numéro</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Client</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Montant</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Statut</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((facture) => (
                  <tr key={facture.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-blue-700">{facture.number}</td>
                    <td className="px-4 py-3 text-gray-700">{facture.client.name}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {facture.totalAmount.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        facture.status === "PAID"
                          ? "bg-green-100 text-green-600"
                          : facture.status === "OVERDUE"
                          ? "bg-red-100 text-red-500"
                          : "bg-orange-100 text-orange-500"
                      }`}>
                        {facture.status === "PAID" ? "Payée" : facture.status === "OVERDUE" ? "En retard" : "Impayée"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(facture.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}