import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardLayoutClient from "@/app/dashboard/layout-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect("/auth")
  if (session.user.mustChangePassword) redirect("/auth/change-password")

  return (
    <DashboardLayoutClient   role={session.user.role}
  name={session.user.name ?? ""}
>
      {children}
    </DashboardLayoutClient>
  )
}