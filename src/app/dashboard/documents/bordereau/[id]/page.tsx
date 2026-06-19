import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BordereauDetailClient from "./BordereauDetailClient"

export default async function BordereauDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/auth")

  const { id } = await params

  const bordereau = await prisma.bordereau.findUnique({
    where: { id },
    include: { client: true, items: true }, 

  })

  if (!bordereau) redirect("/dashboard/documents")

  const vendeur = await prisma.user.findUnique({
    where: { id: (session as any).user.id },
    select: {
      name: true, phone: true, email: true,
      raisonSociale: true, adresse: true, ville: true,
      pays: true, numeroRCCM: true, numeroContribuable: true,
    },
  })

  return <BordereauDetailClient bordereau={bordereau as any} vendeur={vendeur as any} />
}