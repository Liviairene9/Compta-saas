import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "5 000 FCFA",
    period: "/ mois",
    features: ["Jusqu'à 50 factures/mois", "1 utilisateur", "Export PDF"],
    color: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    name: "Business",
    price: "15 000 FCFA",
    period: "/ mois",
    features: ["Factures illimitées", "5 utilisateurs", "Export PDF", "Rappels SMS/WhatsApp"],
    color: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "30 000 FCFA",
    period: "/ mois",
    features: ["Tout illimité", "Utilisateurs illimités", "Support prioritaire", "Rapports avancés"],
    color: "border-green-200",
    badge: "bg-green-100 text-green-700",
  },
]

export default function AbonnementsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Abonnements</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gérez les plans et abonnements des utilisateurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <CheckCircle size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Abonnements actifs</p>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <XCircle size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Abonnements expirés</p>
            <p className="text-2xl font-bold text-red-500">0</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <Clock size={22} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">En attente</p>
            <p className="text-2xl font-bold text-orange-500">0</p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Plans disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${plan.color} relative`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Populaire
                </span>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.badge}`}>
                  {plan.name}
                </span>
                <CreditCard size={18} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {plan.price}
                <span className="text-sm font-normal text-gray-500">{plan.period}</span>
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Liste abonnements */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Abonnements en cours
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <CreditCard size={36} className="mb-3 opacity-30" />
          <p className="text-sm">Aucun abonnement actif pour le moment</p>
        </div>
      </div>
    </div>
  )
}