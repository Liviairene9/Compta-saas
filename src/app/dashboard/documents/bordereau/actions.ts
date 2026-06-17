"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

interface SaveBordereauInput {
  id?: string // 👈 Ajouté pour gérer les modifications !
  numeroBordereau: string
  clientNom: string
  clientAdresse: string
  clientTelephone: string
  clientIfu?: string
  dateLivraison: string // Reçu du formulaire sous forme "YYYY-MM-DD"
  adresseLivraison: string
  livreur: string
  modeTransport: string
  immatriculation: string
  nombreColis: number
  conditionsLivraison: string
  payeALaLivraison: boolean
}

export async function saveBordereauAction(data: SaveBordereauInput) {
  const session = await auth()
  if (!session || !(session as any).user?.id) {
    return { error: "Non connecté" }
  }

  const userId = (session as any).user.id

  // ─── VALIDATION DE LA DATE ─────────────────────────────────────────
  const parsedDate = new Date(data.dateLivraison)
  if (isNaN(parsedDate.getTime())) {
    return { error: "La date de livraison est invalide." }
  }
  // ───────────────────────────────────────────────────────────────────

  try {
    // 1. Recherche ou création du client
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

    // 2. Préparation des données communes du Bordereau
    const bordereauData = {
      number: data.numeroBordereau,
      
      // 💡 CORRECTION DU SOUCI DE DATE :
      // Si ton schéma Prisma attend un DateTime -> laisse 'parsedDate'
      // Si ton schéma attend un String -> remplace par 'data.dateLivraison'
      dateLivraison: parsedDate, 
      
      adresseLivraison: data.adresseLivraison,
      livreur: data.livreur || null,
      modeTransport: data.modeTransport,
      immatriculation: data.immatriculation || null,
      nombreColis: Number(data.nombreColis) || 1,
      conditionsLivraison: data.conditionsLivraison || null,
      payeALaLivraison: data.payeALaLivraison,
      clientId: client.id,
    }

    let savedBordereau

    // 3. Si un ID existe, on MODIFIE, sinon on CRÉE
    if (data.id) {
      // Vérification de sécurité pour être sûr que c'est le bon propriétaire
      const existing = await prisma.bordereau.findFirst({
        where: { id: data.id, ownerId: userId }
      })

      if (!existing) return { error: "Bordereau introuvable ou non autorisé." }

      savedBordereau = await prisma.bordereau.update({
        where: { id: data.id },
        data: bordereauData,
      })
    } else {
      // Création d'un nouveau document
      savedBordereau = await prisma.bordereau.create({
        data: {
          ...bordereauData,
          id: crypto.randomUUID(),
          ownerId: userId,
        },
      })
    }

    revalidatePath("/dashboard/documents")
    return { success: true, id: savedBordereau.id }
  } catch (error) {
    console.error("Erreur saveBordereauAction:", error)
    return { error: "Erreur lors de la sauvegarde du bordereau" }
  }
}

export async function deleteBordereauAction(id: string) {
  const session = await auth()
  if (!session || !(session as any).user?.id) {
    return { error: "Non connecté" }
  }

  const userId = (session as any).user.id

  try {
    await prisma.bordereau.deleteMany({
      where: {
        id: id,
        ownerId: userId,
      },
    })

    revalidatePath("/dashboard/documents")
    return { success: true }
  } catch (error) {
    console.error("Erreur deleteBordereauAction:", error)
    return { error: "Erreur lors de la suppression du bordereau" }
  }
}