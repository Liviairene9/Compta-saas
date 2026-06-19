import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DevisDetailClient from "./DevisDetailClient"

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/auth")

  const { id } = await params

  const devis = await prisma.devis.findUnique({
    where: { id },
      include: { client: true, items: true }, 

  })

  if (!devis) redirect("/dashboard/documents")

  const vendeur = await prisma.user.findUnique({
    where: { id: (session as any).user.id },
    select: {
      name: true, phone: true, email: true,
      raisonSociale: true, adresse: true, ville: true,
      pays: true, numeroRCCM: true, numeroContribuable: true,
      numeroTVA: true, cgv: true,
    },
  })

  return <DevisDetailClient devis={devis as any} vendeur={vendeur as any} />
}