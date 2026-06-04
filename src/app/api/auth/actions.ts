"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-]/g, "")
  
  if (cleaned.startsWith("+")) return cleaned
  
  if (cleaned.startsWith("00")) return "+" + cleaned.slice(2)
  
  return cleaned
}

export async function loginAction(formData: FormData) {
  const rawPhone = formData.get("phone") as string
  const password = formData.get("password") as string
  const phone = normalizePhone(rawPhone)

  // Cherche avec le numéro normalisé ET le numéro brut
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: phone },
        { phone: rawPhone },
        { phone: rawPhone.replace(/^(\+237|237)/, "") },
      ],
    },
  })

  if (!user || !user.isActive) {
    return { error: "Téléphone ou mot de passe incorrect" }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { error: "Téléphone ou mot de passe incorrect" }
  }

  await signIn("credentials", {
    phone: user.phone, // utilise le numéro exact en base
    password,
    redirect: false,
  })

  if (user.role === "ADMIN") redirect("/admin")
  redirect("/dashboard")
}