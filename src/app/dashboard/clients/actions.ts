"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveClientAction(formData: FormData) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  const name = formData.get("name") as string
  if (!name) return { error: "Le nom est obligatoire" }

  try {
    await prisma.client.create({
      data: {
        id: crypto.randomUUID(),
        name,
        phone: (formData.get("phone") as string) || null,
        email: (formData.get("email") as string) || null,
        address: (formData.get("address") as string) || null,
        ownerId: (session as any).user.id,
      },
    })
    revalidatePath("/dashboard/clients")
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de l'enregistrement" }
  }
}

export async function deleteClientAction(clientId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    await prisma.client.delete({ where: { id: clientId } })
    revalidatePath("/dashboard/clients")
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la suppression" }
  }
}