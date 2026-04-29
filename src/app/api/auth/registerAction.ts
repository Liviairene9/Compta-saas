"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  if (!name || !phone || !password) {
    return { error: "Champs obligatoires manquants" }
  }

  const existing = await prisma.user.findUnique({ where: { phone } })
  if (existing) return { error: "Ce numéro est déjà utilisé" }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name,
      email: email || null,
      phone,
      passwordHash,
      role: "OWNER",
    },
  })

  return { success: true }
}