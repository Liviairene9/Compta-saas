import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardLayoutClient from "@/app/dashboard/layout-client"
import { prisma } from "@/lib/prisma"
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect("/auth")
  if (session.user.mustChangePassword) redirect("/auth/change-password")

const rappelsCount = await prisma.invoice.count({
  where: {
    ownerId: (session as any).user.id,
    status: { in: ["UNPAID", "OVERDUE"] },
  },
})

return (
  <DashboardLayoutClient
    role={session.user.role}
    name={session.user.name ?? ""}
    rappelsCount={rappelsCount}
  >
    {children}
  </DashboardLayoutClient>
)
}