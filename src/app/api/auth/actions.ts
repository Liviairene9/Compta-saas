"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  // Vérifier les credentials manuellement pour récupérer le rôle
  const user = await prisma.user.findUnique({ where: { phone } })

  if (!user || !user.isActive) {
    return { error: "Téléphone ou mot de passe incorrect" }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { error: "Téléphone ou mot de passe incorrect" }
  }

  // Connecter avec NextAuth
  await signIn("credentials", {
    phone,
    password,
    redirect: false,
  })

  // Rediriger selon le rôle
  if (user.role === "ADMIN") redirect("/admin")
  if (user.role === "CLIENT") redirect("/client")
  redirect("/dashboard")
}