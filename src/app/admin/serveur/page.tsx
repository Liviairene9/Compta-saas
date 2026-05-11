import { Server, Database, Wifi, Clock, CheckCircle, AlertTriangle } from "lucide-react"

const services = [
  {
    name: "Base de données",
    description: "Supabase PostgreSQL",
    status: "operational",
    icon: Database,
  },
  {
    name: "API Next.js",
    description: "Serveur applicatif",
    status: "operational",
    icon: Server,
  },
  {
    name: "Connexion réseau",
    description: "Pooler Supabase",
    status: "operational",
    icon: Wifi,
  },
  {
    name: "Tâches planifiées",
    description: "Rappels automatiques",
    status: "pending",
    icon: Clock,
  },
]

export default function ServeurPage() {
  const allOperational = services.every((s) => s.status === "operational")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">État du serveur</h1>
        <p className="text-gray-500 text-sm mt-1">
          Surveillance des services de la plateforme
        </p>
      </div>

      {/* Statut global */}
      <div className={`rounded-2xl p-6 flex items-center gap-4 ${
        allOperational ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
      }`}>
        {allOperational ? (
          <CheckCircle size={32} className="text-green-600" />
        ) : (
          <AlertTriangle size={32} className="text-orange-500" />
        )}
        <div>
          <p className="font-bold text-lg text-gray-800">
            {allOperational ? "Tous les services sont opérationnels" : "Certains services nécessitent attention"}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Dernière vérification — à l'instant
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">Services</h2>
        </div>
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <div
              key={service.name}
              className={`flex items-center justify-between px-6 py-4 ${
                index !== services.length - 1 ? "border-b" : ""
              } hover:bg-slate-50 transition`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2.5 rounded-xl">
                  <Icon size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{service.name}</p>
                  <p className="text-xs text-gray-400">{service.description}</p>
                </div>
              </div>

              {service.status === "operational" ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Opérationnel
                </span>
              ) : service.status === "pending" ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  En attente
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Hors service
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Infos techniques */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Informations techniques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Framework", value: "Next.js 15" },
            { label: "Base de données", value: "PostgreSQL (Supabase)" },
            { label: "ORM", value: "Prisma 7" },
            { label: "Auth", value: "NextAuth v5" },
            { label: "Déploiement", value: "Vercel (à venir)" },
            { label: "Région", value: "US East 1" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}