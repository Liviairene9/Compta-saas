"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateCompteAction(formData: FormData) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: formData.get("name") as string,
        email: (formData.get("email") as string) || null,
        raisonSociale: (formData.get("raisonSociale") as string) || null,
        adresse: (formData.get("adresse") as string) || null,
        ville: (formData.get("ville") as string) || null,
        pays: (formData.get("pays") as string) || null,
        numeroRCCM: (formData.get("numeroRCCM") as string) || null,
        numeroContribuable: (formData.get("numeroContribuable") as string) || null,
        numeroTVA: (formData.get("numeroTVA") as string) || null,
        cgv: (formData.get("cgv") as string) || null,
      },
    })

    revalidatePath("/dashboard/compte")
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la mise à jour" }
  }
}