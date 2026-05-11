"use client"

import { useState } from "react"
import { UserCheck, UserX } from "lucide-react"
import { toggleActiveAction } from "./actions"

export default function ToggleActiveButton({
  userId,
  isActive,
  userName,
}: {
  userId: string
  isActive: boolean
  userName: string
}) {
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(isActive)

  async function handleToggle() {
    setLoading(true)
    const formData = new FormData()
    formData.append("userId", userId)
    formData.append("isActive", String(!active))
    await toggleActiveAction(formData)
    setActive(!active)
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition text-sm w-fit ${
        active
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-green-50 text-green-600 hover:bg-green-100"
      }`}
    >
      {active ? <UserX size={16} /> : <UserCheck size={16} />}
      {loading
        ? "En cours..."
        : active
        ? `Désactiver ${userName}`
        : `Activer ${userName}`}
    </button>
  )
}