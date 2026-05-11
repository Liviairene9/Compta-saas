import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LayoutClient from "@/app/client/layout-client"

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect("/auth")
  if (session.user.role !== "CLIENT") redirect("/dashboard")

  return (
    <LayoutClient name={session.user.name ?? ""}>
      {children}
    </LayoutClient>
  )
}