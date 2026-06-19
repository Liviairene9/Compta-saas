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
    ...devis.map((d) => ({ ...d, totalAmount: d.totalAmount ?? 0, type: "DEVIS" as const })),
...bonsCommande.map((b) => ({ ...b, totalAmount: b.totalAmount ?? 0, type: "BON_COMMANDE" as const })),
...bordereaux.map((b) => ({ ...b, totalAmount: b.totalAmount ?? 0, type: "BORDEREAU" as const })),
...factures.map((f) => ({ ...f, totalAmount: f.totalAmount ?? 0, type: "FACTURE" as const })),
  ]

  return <DocumentsClient documents={documents} />
}