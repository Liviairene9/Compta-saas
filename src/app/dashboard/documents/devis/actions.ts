"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveDevisAction(data: {
  numeroDevis: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  clientIfu?: string
  totalTTC: number
  dateValidite: string
  remise?: number
  conditionsReglement?: string
  delaisLivraison?: string
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
          ifu: data.clientIfu || null,
          ownerId: (session as any).user.id,
        },
      })
    }

    const devisId = crypto.randomUUID()

    await prisma.devis.create({
      data: {
        id: devisId,
        number: data.numeroDevis,
        totalAmount: data.totalTTC,
        dueDate: new Date(data.dateValidite),
        dateValidite: data.dateValidite,
        remise: data.remise || 0,
        conditionsReglement: data.conditionsReglement || null,
        delaisLivraison: data.delaisLivraison || null,
        ownerId: (session as any).user.id,
        clientId: client.id,
      },
    })

    revalidatePath("/dashboard/documents")
    return { success: true, id: devisId }
  } catch (error) {
    console.error(error)
    return { error: "Erreur lors de la sauvegarde" }
  }
}

export async function deleteDevisAction(devisId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    await prisma.devis.delete({
      where: { id: devisId },
    })
    revalidatePath("/dashboard/documents")
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la suppression" }
  }
}