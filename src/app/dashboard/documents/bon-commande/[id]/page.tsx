import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BonCommandeDetailClient from "./BonCommandeDetailClient"

export default async function BonCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/auth")

  const { id } = await params

  const bonCommande = await prisma.bonCommande.findUnique({
    where: { id },
  include: { client: true, items: true }, 

  })

  if (!bonCommande) redirect("/dashboard/documents")

  const vendeur = await prisma.user.findUnique({
    where: { id: (session as any).user.id },
    select: {
      name: true, phone: true, email: true,
      raisonSociale: true, adresse: true, ville: true,
      pays: true, numeroRCCM: true, numeroContribuable: true,
      numeroTVA: true,
    },
  })

  return <BonCommandeDetailClient bonCommande={bonCommande as any} vendeur={vendeur as any} />
}