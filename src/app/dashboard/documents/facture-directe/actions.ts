"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

    const factureId = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "Invoice" (
        id, number, status, "totalAmount", "dueDate", "createdAt", "ownerId", "clientId"
      ) VALUES (
        ${factureId},
        ${data.numeroFacture},
        'UNPAID'::"InvoiceStatus",
        ${data.totalTTC},
        ${new Date(data.dateEcheance)},
        ${new Date(data.dateFacture)},
        ${(session as any).user.id},
        ${client.id}
      )
    `

    // Sauvegarder les lignes
    for (const ligne of data.lignes) {
      if (!ligne.designation) continue
      await prisma.$executeRaw`
        INSERT INTO "InvoiceItem" (id, "invoiceId", description, quantity, "unitPrice", total)
        VALUES (
          ${crypto.randomUUID()},
          ${factureId},
          ${ligne.designation},
          ${ligne.quantite},
          ${ligne.prixUnitaire},
          ${ligne.total}
        )
      `
    }

    revalidatePath("/dashboard/documents")
    revalidatePath("/dashboard")
    return { success: true, id: factureId }
  } catch (error: any) {
    console.error("Erreur saveFactureAction:", error?.message || error)
    return { error: "Erreur lors de la sauvegarde" }
  }
}
export async function deleteFactureAction(factureId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    await prisma.$executeRaw`
      DELETE FROM "Invoice"
      WHERE id = ${factureId} AND "ownerId" = ${(session as any).user.id}
    `
    revalidatePath("/dashboard/documents")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la suppression" }
  }
}