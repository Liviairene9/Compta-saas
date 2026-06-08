"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveDevisAction(data: {
  numeroDevis: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  totalTTC: number
  dateValidite: string
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

    await prisma.devis.create({
      data: {
        id: crypto.randomUUID(),
        number: data.numeroDevis,
        totalAmount: data.totalTTC,
        dueDate: new Date(data.dateValidite),
        ownerId: (session as any).user.id,
        clientId: client.id,
      },
    })

    revalidatePath("/dashboard/documents")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erreur lors de la sauvegarde" }
  }
}