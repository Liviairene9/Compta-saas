import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RappelsClient from "./RappelsClient"

export default async function RappelsPage() {
  const session = await auth()
  if (!session) redirect("/auth")

  const ownerId = (session as any).user.id

  const facturesImpayes = await prisma.invoice.findMany({
    where: {
      ownerId,
      status: { in: ["UNPAID", "OVERDUE"] },
    },
    include: { client: true },
    orderBy: { dueDate: "asc" },
  })

  return <RappelsClient factures={facturesImpayes as any} />
}