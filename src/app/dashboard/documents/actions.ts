"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateFactureStatusAction(id: string, status: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  await prisma.$executeRaw`
    UPDATE "Invoice" SET status = ${status}::"InvoiceStatus"
    WHERE id = ${id} AND "ownerId" = ${(session as any).user.id}
  `

  revalidatePath("/dashboard/documents")
  revalidatePath("/dashboard")
  return { success: true }
}