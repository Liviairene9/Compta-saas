import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "@/app/auth/auth.config" 

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // On déverse la config de base
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone as string },
        })

        if (!user || !user.isActive) return null

        // Utilise bcryptjs qui est plus léger, mais attention au Edge
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.mustChangePassword = (user as any).mustChangePassword
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
        session.user.mustChangePassword = token.mustChangePassword as boolean
      }
      return session
    },
  },
})