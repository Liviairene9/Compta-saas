import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminLayoutClient from "@/app/admin/layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect("/auth")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  return (
    <AdminLayoutClient name={session.user.name ?? ""}>
      {children}
    </AdminLayoutClient>
  )
}