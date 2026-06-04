"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function saveFactureAction(data: {
  numeroFacture: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  lignes: {
    designation: string
    categorie: string
    quantite: number
    prixUnitaire: number
    total: number
  }[]
  tva: number
  modePaiement: string
  sousTotal: number
  montantTva: number
  totalTTC: number
  dateFacture: string
  dateEcheance: string
}) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    // Chercher ou créer le client
    let client = await prisma.client.findFirst({
      where: {
        name: data.clientNom,
        ownerId: (session as any).user.id,
      },
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

    // Créer la facture
    await prisma.$executeRaw`
      INSERT INTO "Invoice" (
        id, number, status, "totalAmount", "dueDate", "createdAt", "ownerId", "clientId"
      ) VALUES (
        ${crypto.randomUUID()},
        ${data.numeroFacture},
        'UNPAID'::"InvoiceStatus",
        ${data.totalTTC},
        ${new Date(data.dateEcheance)},
        ${new Date(data.dateFacture)},
        ${(session as any).user.id},
        ${client.id}
      )
    `

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erreur lors de la sauvegarde" }
  }
}