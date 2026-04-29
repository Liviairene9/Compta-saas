"use client"

import React, { useState } from "react"
import { loginAction } from "@/app/api/auth/actions"
import { registerAction } from "@/app/api/auth/registerAction"

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)
    if (result?.error) setError(result.error)
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await registerAction(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setIsLogin(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      {/* Onglets */}
      <div className="flex mb-6 bg-white rounded-xl p-1 shadow-md w-full max-w-md">
        <button
          onClick={() => { setIsLogin(true); setError("") }}
          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${
            isLogin ? "bg-blue-700 text-white" : "bg-transparent text-gray-400"
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => { setIsLogin(false); setError("") }}
          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${
            !isLogin ? "bg-blue-700 text-white" : "bg-transparent text-gray-400"
          }`}
        >
          Inscription
        </button>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden min-h-[580px] flex items-stretch">
        <div
          className="flex transition-transform duration-500 ease-in-out w-full"
          style={{ transform: isLogin ? "translateX(0%)" : "translateX(-100%)" }}
        >
          {/* CONNEXION */}
          <div className="w-full flex-shrink-0 p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">Connexion</h2>
            {error && isLogin && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1">Téléphone</label>
                <input
                  name="phone"
                  type="text"
                  required
                  className="bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="XXXXXXXXXX"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1">Mot de passe</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-800 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Pas encore de compte ?{" "}
                <span onClick={() => { setIsLogin(false); setError("") }} className="text-blue-700 font-bold cursor-pointer hover:underline">
                  Inscrivez-vous
                </span>
              </p>
            </form>
          </div>

          {/* INSCRIPTION */}
          <div className="w-full flex-shrink-0 p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">Inscription</h2>
            {error && !isLogin && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1 text-sm">Nom complet</label>
                <input name="name" type="text" required className="bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm" placeholder="Votre nom" />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1 text-sm">E-mail</label>
                <input name="email" type="email" className="bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm" placeholder="votre@email.com" />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1 text-sm">Téléphone</label>
                <input name="phone" type="text" required className="bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm" placeholder="+237 6..." />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1 text-sm">Mot de passe</label>
                <input name="password" type="password" required className="bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm" placeholder="••••••••" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-800 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer mon compte"}
              </button>
              <p className="text-center text-sm text-gray-500 mt-2">
                Déjà un compte ?{" "}
                <span onClick={() => { setIsLogin(true); setError("") }} className="text-blue-700 font-bold cursor-pointer hover:underline">
                  Connectez-vous
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}