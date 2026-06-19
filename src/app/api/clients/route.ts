import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json([], { status: 401 })

  const clients = await prisma.client.findMany({
    where: { ownerId: (session as any).user.id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
        ifu: true,  

    }
  })

  return NextResponse.json(clients)
}