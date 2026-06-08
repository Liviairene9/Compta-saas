import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RapportsClient from "./RapportsClient"

export default async function RapportsPage() {
  const session = await auth()
  if (!session) redirect("/auth")

  const ownerId = (session as any).user.id

  const factures = await prisma.invoice.findMany({
    where: { ownerId },
    include: { client: true },
    orderBy: { createdAt: "asc" },
  })

  return <RapportsClient factures={factures as any} />
}