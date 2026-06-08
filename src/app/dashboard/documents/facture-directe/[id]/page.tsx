import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import FactureDetailClient from "./FactureDetailClient"

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/auth")

  const { id } = await params

  const facture = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: true },
  })

  if (!facture) redirect("/dashboard/documents")

  const vendeur = await prisma.user.findUnique({
    where: { id: (session as any).user.id },
    select: {
      name: true,
      phone: true,
      email: true,
      raisonSociale: true,
      adresse: true,
      ville: true,
      pays: true,
      numeroRCCM: true,
      numeroContribuable: true,
      numeroTVA: true,
      cgv: true,
    },
  })

  return <FactureDetailClient facture={facture as any} vendeur={vendeur as any} />
}