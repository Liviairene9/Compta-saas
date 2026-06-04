"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(5, "Numéro invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre")
    .regex(/[^a-zA-Z0-9]/, "Au moins un caractère spécial"),
})

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
  }

  const result = registerSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { phone: raw.phone },
    })
    if (existing) return { error: "Ce numéro est déjà utilisé" }

    const passwordHash = await bcrypt.hash(raw.password, 12)

    await prisma.$executeRaw`
      INSERT INTO "User" (id, name, email, phone, "passwordHash", role, "mustChangePassword", "isActive", "createdAt", "updatedAt")
      VALUES (
        ${crypto.randomUUID()},
        ${raw.name},
        ${raw.email || null},
        ${raw.phone},
        ${passwordHash},
        'OWNER'::"Role",
        false,
        true,
        NOW(),
        NOW()
      )
    `

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erreur lors de la création du compte" }
  }
}