"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveBordereauAction(data: {
  numeroBordereau: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  clientIfu?: string
  dateLivraison: string
  adresseLivraison: string
  observations: string
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
          ifu: data.clientIfu || null,
          ownerId: userId,
        },
      })
    }

    const bordereauId = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "Bordereau" (id, number, "totalAmount", "livreur", "createdAt", "ownerId", "clientId")
      VALUES (
        ${bordereauId},
        ${data.numeroBordereau},
        ${0},
        ${data.observations || null},
        ${new Date()},
        ${userId},
        ${client.id}
      )
    `

    // Sauvegarder les lignes
    if (data.lignes && data.lignes.length > 0) {
      for (const ligne of data.lignes) {
        await prisma.$executeRaw`
          INSERT INTO "BordereauItem" (id, "bordereauId", designation, categorie, quantite)
          VALUES (
            ${crypto.randomUUID()},
            ${bordereauId},
            ${ligne.designation || ""},
            ${ligne.categorie || null},
            ${ligne.quantite || 0}
          )
        `
      }
    }

    revalidatePath("/dashboard", "layout")
    revalidatePath("/dashboard/documents")
    return { success: true, id: bordereauId }
  } catch (error: any) {
    console.error("Erreur saveBordereauAction:", error?.message || error)
    return { error: `Erreur: ${error?.message || "inconnue"}` }
  }
}
export async function deleteBordereauAction(data: {
  numeroBordereau: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  clientIfu?: string
  dateLivraison: string
  adresseLivraison: string
  observations: string
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
          ifu: data.clientIfu || null,
          ownerId: userId,
        },
      })
    }

    const bordereauId = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "Bordereau" (id, number, "totalAmount", "livreur", "createdAt", "ownerId", "clientId")
      VALUES (
        ${bordereauId},
        ${data.numeroBordereau},
        ${0},
        ${data.observations || null},
        ${new Date()},
        ${userId},
        ${client.id}
      )
    `

    // Sauvegarder les lignes
    if (data.lignes && data.lignes.length > 0) {
      for (const ligne of data.lignes) {
        await prisma.$executeRaw`
          INSERT INTO "BordereauItem" (id, "bordereauId", designation, categorie, quantite)
          VALUES (
            ${crypto.randomUUID()},
            ${bordereauId},
            ${ligne.designation || ""},
            ${ligne.categorie || null},
            ${ligne.quantite || 0}
          )
        `
      }
    }

    revalidatePath("/dashboard", "layout")
    revalidatePath("/dashboard/documents")
    return { success: true, id: bordereauId }
  } catch (error: any) {
    console.error("Erreur saveBordereauAction:", error?.message || error)
    return { error: `Erreur: ${error?.message || "inconnue"}` }
  }
}