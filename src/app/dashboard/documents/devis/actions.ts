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
  lignes?: any[]
  sousTotal?: number
  totalHT?: number
  montantTva?: number
  totalTTC: number
  dateDevis?: string
  dateValidite: string
  remise?: number
  tva?: number
  modePaiement?: string
  conditionsReglement?: string
  delaisLivraison?: string
}) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  const userId = (session as any).user.id

  try {
    let client = await prisma.client.findFirst({
      where: { name: data.clientNom, ownerId: userId },
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          id: crypto.randomUUID(),
          name: data.clientNom,
          address: data.clientAdresse || null,
          phone: data.clientTelephone || null,
          ifu: data.clientIfu || null,
          ownerId: userId,
        },
      })
    }

    const devisId = crypto.randomUUID()
    const parsedDate = new Date(data.dateValidite)
    const dueDateValue = isNaN(parsedDate.getTime()) ? new Date() : parsedDate

    await prisma.$executeRaw`
      INSERT INTO "Devis" (
        id, number, status, "totalAmount", "dueDate", "createdAt",
        "ownerId", "clientId", "remise", "conditionsReglement", "delaisLivraison", "dateValidite"
      ) VALUES (
        ${devisId},
        ${data.numeroDevis},
        'PENDING'::"DevisStatus",
        ${data.totalTTC},
        ${dueDateValue},
        ${new Date()},
        ${userId},
        ${client.id},
        ${data.remise || 0},
        ${data.conditionsReglement || null},
        ${data.delaisLivraison || null},
        ${data.dateValidite}
      )
    `

    if (data.lignes && data.lignes.length > 0) {
      for (const ligne of data.lignes) {
        await prisma.$executeRaw`
          INSERT INTO "DevisItem" (id, "devisId", designation, categorie, quantite, "prixUnitaire", total)
          VALUES (
            ${crypto.randomUUID()},
            ${devisId},
            ${ligne.designation || ""},
            ${ligne.categorie || null},
            ${ligne.quantite || 0},
            ${ligne.prixUnitaire || 0},
            ${ligne.total || 0}
          )
        `
      }
    }

    revalidatePath("/dashboard", "layout")
    revalidatePath("/dashboard/documents")
    return { success: true, id: devisId }
  } catch (error: any) {
    console.error("Erreur saveDevisAction:", error?.message || error)
    return { error: `Erreur: ${error?.message || "inconnue"}` }
  }
}

export async function deleteDevisAction(devisId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    await prisma.$executeRaw`
      DELETE FROM "DevisItem" WHERE "devisId" = ${devisId}
    `
    await prisma.$executeRaw`
      DELETE FROM "Devis" WHERE id = ${devisId} AND "ownerId" = ${(session as any).user.id}
    `
    revalidatePath("/dashboard", "layout")
    revalidatePath("/dashboard/documents")
    return { success: true }
  } catch (error: any) {
    console.error("Erreur deleteDevisAction:", error?.message)
    return { error: "Erreur lors de la suppression" }
  }
}