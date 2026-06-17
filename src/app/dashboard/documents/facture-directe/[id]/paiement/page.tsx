import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PaiementClient from "./PaiementClient"

export default async function PaiementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/auth")

  const { id } = await params

  const facture = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  })

  if (!facture) redirect("/dashboard/documents")

  return <PaiementClient facture={facture as any} />
}