import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DocumentsClient from "./DocumentsClient"

export default async function DocumentsPage() {
  const session = await auth()
  if (!session) redirect("/auth")

  const ownerId = (session as any).user.id

  const [factures, devis, bonsCommande, bordereaux] = await Promise.all([
    prisma.invoice.findMany({
      where: { ownerId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.devis.findMany({
      where: { ownerId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bonCommande.findMany({
      where: { ownerId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bordereau.findMany({
      where: { ownerId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const documents = [
    ...factures.map((f) => ({ ...f, type: "FACTURE" as const })),
    ...devis.map((d) => ({ ...d, type: "DEVIS" as const })),
    ...bonsCommande.map((b) => ({ ...b, type: "BON_COMMANDE" as const })),
    ...bordereaux.map((b) => ({ ...b, type: "BORDEREAU" as const })),
  ]

  return <DocumentsClient documents={documents} />
}