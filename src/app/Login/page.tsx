"use client";

import React, { useState } from 'react';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      {/* Sélecteur d'onglets */}
      <div className="flex mb-6 bg-white rounded-xl p-1 shadow-md w-full max-w-md">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${
            isLogin ? 'bg-blue-700 text-white' : 'bg-transparent text-gray-400'
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${
            !isLogin ? 'bg-blue-700 text-white' : 'bg-transparent text-gray-400'
          }`}
        >
          Inscription
        </button>
      </div>

      {/* Conteneur principal - Hauteur augmentée pour accommoder les nouveaux champs */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden min-h-[580px] flex items-stretch">
        
        <div 
          className="flex transition-transform duration-500 ease-in-out w-full"
          style={{ transform: isLogin ? 'translateX(0%)' : 'translateX(-100%)' }}
        >
          
          {/* SECTION CONNEXION */}
          <div className="w-full flex-shrink-0 p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">Connexion</h2>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1">E-mail ou Téléphone</label>
                <input 
                  type="text" 
                  className="bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="exemple@mail.com" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1">Mot de passe</label>
                <input 
                  type="password" 
                  className="bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="••••••••" 
                />
              </div>
              <button className="bg-blue-800 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-900 transition-colors">
                Se connecter
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Pas encore de compte ?{' '}
                <span onClick={() => setIsLogin(false)} className="text-blue-700 font-bold cursor-pointer hover:underline">
                  Inscrivez-vous
                </span>
              </p>
            </form>
          </div>

          {/* SECTION INSCRIPTION */}
          <div className="w-full flex-shrink-0 p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">Inscription</h2>
            <form className="flex flex-col gap-3">
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1 text-sm">Nom complet</label>
                <input type="text" className="bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm" placeholder="Votre nom" />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1 text-sm">E-mail</label>
                <input type="email" className="bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm" placeholder="votre@email.com" />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1 text-sm">Téléphone</label>
                <input type="text" className="bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm" placeholder="+237 6..." />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-1 text-sm">Mot de passe</label>
                <input type="password" className="bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm" placeholder="••••••••" />
              </div>
              <button className="bg-blue-800 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-900 transition-colors">
                Créer mon compte
              </button>
              <p className="text-center text-sm text-gray-500 mt-2">
                Déjà un compte ?{' '}
                <span onClick={() => setIsLogin(true)} className="text-blue-700 font-bold cursor-pointer hover:underline">
                  Connectez-vous
                </span>
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}