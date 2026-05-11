"use client"

import { useState } from "react"
import { KeyRound, Eye, EyeOff } from "lucide-react"
import { resetPasswordAction } from "./actions"

export default function ResetPasswordButton({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleReset() {
    if (password.length < 8) {
      setMessage("Minimum 8 caractères")
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append("userId", userId)
    formData.append("password", password)
    const result = await resetPasswordAction(formData)
    if (result?.error) {
      setMessage(result.error)
    } else {
      setMessage("Mot de passe réinitialisé avec succès")
      setShowForm(false)
      setPassword("")
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition text-sm w-fit"
      >
        <KeyRound size={16} />
        Réinitialiser le mot de passe
      </button>

      {showForm && (
        <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-gray-600">
            Nouveau mot de passe pour <strong>{userName}</strong>
          </p>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full border border-gray-200 bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {message && (
            <p className={`text-xs ${
              message.includes("succès") ? "text-green-600" : "text-red-500"
            }`}>
              {message}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? "En cours..." : "Confirmer"}
            </button>
            <button
              onClick={() => { setShowForm(false); setMessage("") }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}