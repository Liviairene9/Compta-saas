import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CompteClient from "@/app/dashboard/compte/CompteClient"

export default async function ComptePage() {
  const session = await auth()
  if (!session) redirect("/auth")

  const user = await prisma.user.findUnique({
    where: { id: (session as any).user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      raisonSociale: true,
      adresse: true,
      ville: true,
      pays: true,
      numeroRCCM: true,
      numeroContribuable: true,
      numeroTVA: true,
      cgv: true,
    }
  })

  if (!user) redirect("/auth")

  return <CompteClient user={user!} />
}