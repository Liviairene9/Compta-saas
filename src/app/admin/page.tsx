import {
  Users,
  CreditCard,
  ShieldCheck,
  Server,
} from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Vue générale de la plateforme</p>
      </div>

      {/* Cards stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Users size={30} className="text-blue-700" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">Utilisateurs</p>
            <p className="text-2xl font-bold text-blue-700">3</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <CreditCard size={30} className="text-green-600" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">Abonnements actifs</p>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl">
            <ShieldCheck size={30} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">Admins</p>
            <p className="text-2xl font-bold text-purple-600">1</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Server size={30} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">État serveur</p>
            <p className="text-xl font-bold text-emerald-600">● Opérationnel</p>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Activité récente</h2>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <p className="text-xl">Aucune activité récente</p>
        </div>
      </div>
    </div>
  )
}