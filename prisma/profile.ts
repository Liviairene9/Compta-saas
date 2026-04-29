import "dotenv/config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const password = await bcrypt.hash("Password2026!", 12)

  await prisma.user.upsert({
    where: { phone: "600000000" },
    update: {},
    create: {
      id: "admin-001",
      name: "Admin Principal",
      phone: "600000000",
      passwordHash: password,
      role: "ADMIN",
    },
  })

  await prisma.user.upsert({
    where: { phone: "600000001" },
    update: {},
    create: {
      id: "owner-001",
      name: "Aboubakar sidick",
      phone: "600000001",
      passwordHash: password,
      role: "OWNER",
    },
  })

  await prisma.user.upsert({
    where: { phone: "600000002" },
    update: {},
    create: {
      id: "client-001",
      name: "Marie Belneuve",
      phone: "600000002",
      passwordHash: password,
      role: "CLIENT",
    },
  })

  console.log("Seed OK — 3 utilisateurs créés")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())