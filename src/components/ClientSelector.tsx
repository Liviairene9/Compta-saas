"use client"

import { useState, useEffect, useRef } from "react"
import { Search, User, X } from "lucide-react"

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  ifu: string | null  

}

interface Props {
  onSelect: (client: { nom: string; adresse: string; telephone: string; ifu?: string }) => void
}

export default function ClientSelector({ onSelect }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchClients() {
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(data)
    }
    fetchClients()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  function handleSelect(client: Client) {
    setSelected(client)
    setShowDropdown(false)
    setSearch("")
    onSelect({
      nom: client.name,
      adresse: client.address ?? "",
      telephone: client.phone ?? "",
      ifu: client.ifu ?? "",
    })
  }

  function handleClear() {
    setSelected(null)
    onSelect({ nom: "", adresse: "", telephone: "", ifu: "" })
  }

  return (
    <div className="md:col-span-3 mb-2" ref={ref}>
      <label className="text-sm font-semibold text-gray-600 mb-1 block">
        Sélectionner un client existant
        <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
      </label>

      {selected ? (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold">
              {selected.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700">{selected.name}</p>
              {selected.phone && <p className="text-xs text-gray-500">{selected.phone}</p>}
            </div>
          </div>
          <button onClick={handleClear} className="p-1.5 hover:bg-blue-100 rounded-lg transition">
            <X size={14} className="text-blue-500" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={15} className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-9 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          {showDropdown && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <User size={14} />
                  Aucun client trouvé
                </div>
              ) : (
                filtered.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition text-left border-b last:border-0"
                  >
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{client.name}</p>
                      {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}