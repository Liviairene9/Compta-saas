import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect("/auth")
  if (session.user.mustChangePassword) redirect("/auth/change-password")

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={session.user.role} name={session.user.name ?? ""} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}