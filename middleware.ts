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

  // Protection /admin
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protection /client
  if (pathname.startsWith("/client") && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}