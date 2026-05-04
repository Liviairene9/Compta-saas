import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role
  const isLoggedIn = !!req.auth

  // Routes publiques
  if (pathname === "/" || pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Non connecté → login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  // CLIENT ne peut pas accéder au dashboard ou admin
  if (role === "CLIENT" && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/client", req.url))
  }

  // OWNER ne peut pas accéder à /admin
  if (role === "OWNER" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // ADMIN ne peut pas accéder à /client
  if (role === "ADMIN" && pathname.startsWith("/client")) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}