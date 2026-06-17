"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveBonCommandeAction(data: {
  numeroBon: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  clientIfu?: string
  totalTTC: number
  dateLivraison: string
  adresseLivraison: string
  remise?: number
  conditionsReglement?: string
  modePaiement?: string
}) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    // 1. Recherche ou création du client/fournisseur rattaché à l'utilisateur
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

    const bonCommandeId = crypto.randomUUID()

    // 2. Création du Bon de Commande avec les mentions de livraison OHADA
    await prisma.bonCommande.create({
      data: {
        id: bonCommandeId,
        number: data.numeroBon,
        totalAmount: data.totalTTC,
        dateLivraison: new Date(data.dateLivraison),
        adresseLivraison: data.adresseLivraison,
        remise: data.remise || 0,
        conditionsReglement: data.conditionsReglement || null,
        modePaiement: data.modePaiement || null,
        ownerId: (session as any).user.id,
        clientId: client.id,
      },
    })

    revalidatePath("/dashboard/documents")
    return { success: true, id: bonCommandeId }
  } catch (error) {
    console.error(error)
    return { error: "Erreur lors de la sauvegarde du bon de commande" }
  }
}

export async function deleteBonCommandeAction(bonCommandeId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    await prisma.bonCommande.delete({
      where: { id: bonCommandeId },
    })
    
    revalidatePath("/dashboard/documents")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erreur lors de la suppression du bon de commande" }
  }
}