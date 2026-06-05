import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ClientsClient from "@/app/dashboard/clients/ClientsClient"

export default async function ClientsPage() {
  const session = await auth()
  if (!session) redirect("/auth")

  const clients = await prisma.client.findMany({
    where: { ownerId: (session as any).user.id },
    orderBy: { createdAt: "desc" },
  })

  return <ClientsClient clients={clients} />
}