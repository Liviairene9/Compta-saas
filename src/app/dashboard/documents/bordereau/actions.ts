"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveBordereauAction(data: {
  numeroBordereau: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  totalAmount: number
  livreur: string
}) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    let client = await prisma.client.findFirst({
      where: { name: data.clientNom, ownerId: (session as any).user.id },
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          id: crypto.randomUUID(),
          name: data.clientNom,
          address: data.clientAdresse || null,
          phone: data.clientTelephone || null,
          ownerId: (session as any).user.id,
        },
      })
    }

    await prisma.bordereau.create({
      data: {
        id: crypto.randomUUID(),
        number: data.numeroBordereau,
        totalAmount: data.totalAmount,
        livreur: data.livreur || null,
        ownerId: (session as any).user.id,
        clientId: client.id,
      },
    })

    revalidatePath("/dashboard/documents")
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la sauvegarde" }
  }
}