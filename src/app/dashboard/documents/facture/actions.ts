"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ===================================================
// 1. SAUVEGARDE FACTURE INDIRECTE
// ===================================================
export async function saveFactureIndirecteAction(data: {
  numeroFacture: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  lignes: any[]
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

    revalidatePath("/dashboard/documents")
    revalidatePath("/dashboard")
    return { success: true, id: factureId }
  } catch (error) {
    console.error("Erreur saveFactureIndirecteAction:", error)
    return { error: "Erreur lors de la sauvegarde de la facture indirecte" }
  }
}

// ===================================================
// 2. SAUVEGARDE FACTURE DIRECTE (Ajouté pour FactureDirectePage)
// ===================================================
export async function saveFactureAction(data: {
  numeroFacture: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  lignes: any[]
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
    // 1. Gestion ou récupération du client
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

    // 2. Insertion brute de la facture directe
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

    // Note : Si ton schéma comporte une table pour les lignes d'articles (ex: "InvoiceItem"),
    // tu pourras exécuter un insert multiple ici.

    revalidatePath("/dashboard/documents")
    revalidatePath("/dashboard")
    return { success: true, id: factureId }
  } catch (error) {
    console.error("Erreur saveFactureAction:", error)
    return { error: "Erreur lors de la sauvegarde de la facture directe" }
  }
}

// ===================================================
// 3. ENREGISTRER UN PAIEMENT
// ===================================================
export async function enregistrerPaiementAction(factureId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    await prisma.$executeRaw`
      UPDATE "Invoice" SET status = 'PAID'::"InvoiceStatus"
      WHERE id = ${factureId} AND "ownerId" = ${(session as any).user.id}
    `

    revalidatePath("/dashboard/documents")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Erreur enregistrerPaiementAction:", error)
    return { error: "Impossible de valider le paiement" }
  }
}

// ===================================================
// 4. SUPPRIMER UNE FACTURE (Ajouté pour FactureDirectePage)
// ===================================================
export async function deleteFactureAction(factureId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    // Sécurité stricte basée sur l'ownerId
    await prisma.$executeRaw`
      DELETE FROM "Invoice"
      WHERE id = ${factureId} AND "ownerId" = ${(session as any).user.id}
    `

    revalidatePath("/dashboard/documents")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Erreur deleteFactureAction:", error)
    return { error: "Erreur lors de la suppression de la facture" }
  }
}