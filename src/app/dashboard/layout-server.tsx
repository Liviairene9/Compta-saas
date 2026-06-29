import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ReactNode } from "react"
import DashboardLayoutClient from "./layout-client"

export default async function DashboardLayoutServer({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session) redirect("/auth")

  if ((session as any).user.mustChangePassword) redirect("/auth/change-password")

  const rappelsCount = await prisma.invoice.count({
    where: {
      ownerId: (session as any).user.id,
      status: { in: ["UNPAID", "OVERDUE"] as ("UNPAID" | "OVERDUE" | "PAID")[] },
    },
  })

  return (
    <DashboardLayoutClient
      role={(session as any).user.role}
      name={session.user.name ?? ""}
      rappelsCount={rappelsCount}
    >
      {children}
    </DashboardLayoutClient>
  )
}