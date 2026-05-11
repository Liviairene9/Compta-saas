import type { NextAuthConfig } from "next-auth"

// On définit ici uniquement ce qui est compatible avec le Edge (le middleware)
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Tu peux mettre une logique de base ici si tu veux
      return !!auth;
    },
  },
  providers: [], // On laisse vide ici, on les remplit dans auth.ts
} satisfies NextAuthConfig