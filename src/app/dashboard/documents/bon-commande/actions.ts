"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveBonCommandeAction(data: {
  numeroBon: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  totalTTC: number
  lignes?: any[]
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
          ownerId: userId,
        },
      })
    }

    const bonId = crypto.randomUUID()

    await prisma.bonCommande.create({
      data: {
        id: bonId,
        number: data.numeroBon,
        totalAmount: data.totalTTC,
        ownerId: userId,
        clientId: client.id,
      },
    })

    if (data.lignes && data.lignes.length > 0) {
      for (const ligne of data.lignes) {
        await prisma.$executeRaw`
          INSERT INTO "BonCommandeItem" (id, "bonCommandeId", designation, categorie, quantite, "prixUnitaire", total)
          VALUES (
            ${crypto.randomUUID()},
            ${bonId},
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
    return { success: true, id: bonId }
  } catch (error: any) {
    console.error("Erreur saveBonCommandeAction:", error?.message)
    return { error: "Erreur lors de la sauvegarde" }
  }
}

export async function deleteBonCommandeAction(id: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    await prisma.$executeRaw`
      DELETE FROM "BonCommandeItem" WHERE "bonCommandeId" = ${id}
    `
    await prisma.bonCommande.delete({ where: { id } })
    revalidatePath("/dashboard", "layout")
    revalidatePath("/dashboard/documents")
    return { success: true }
  } catch (error: any) {
    console.error("Erreur deleteBonCommandeAction:", error?.message)
    return { error: "Erreur lors de la suppression" }
  }
}