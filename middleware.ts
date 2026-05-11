import NextAuth from "next-auth"
import { authConfig } from "@/app/auth/auth.config"
import { NextResponse } from "next/server"

// On crée une instance auth spéciale pour le middleware (sans Prisma)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role
  const isLoggedIn = !!req.auth

  // --- Garde ta logique de redirection actuelle ici ---
  // (Le code que tu m'as montré avant est parfait)
  
  if (pathname === "/" || pathname.startsWith("/auth")) {
     return NextResponse.next()
  }
  // ... reste de tes redirections ...
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}