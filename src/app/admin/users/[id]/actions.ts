"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function resetPasswordAction(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Non autorisé" }

  const userId = formData.get("userId") as string
  const password = formData.get("password") as string

  if (password.length < 8) return { error: "Minimum 8 caractères" }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      mustChangePassword: true,
    },
  })

  await prisma.passwordResetLog.create({
    data: {
      userId,
      resetById: session.user.id,
    },
  })

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function toggleActiveAction(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Non autorisé" }

  const userId = formData.get("userId") as string
  const isActive = formData.get("isActive") === "true"

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  })

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}