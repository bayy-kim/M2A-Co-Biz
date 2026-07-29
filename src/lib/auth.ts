import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { authenticator } from "otplib"
import { Redis } from "@upstash/redis"
import { prisma } from "./db"
import { checkRateLimit, checkIpRateLimit } from "./rate-limit"

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

const FAILED_LOGIN_TTL = 15 * 60
const MAX_FAILED_LOGIN = 5

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt", maxAge: 24 * 60 * 60, updateAge: 60 * 60 },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET, // Explicitly set secret to prevent NextAuth v5 Configuration errors
  pages: {
    signIn: "/login",
    error: "/login", // Redirect all NextAuth errors back to custom login page
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "TOTP Code", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
        const rl = await checkRateLimit(`login:${email}:${ip}`, true)
        if (!rl.allowed) return null

        checkIpRateLimit(ip)

        const redis = getRedis()
        if (redis) {
          const failed = await redis.get<number>(`failed-login:${email}`)
          if (failed && failed >= MAX_FAILED_LOGIN) {
            return null
          }
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          if (redis) {
            await redis.incr(`failed-login:${email}`)
            await redis.expire(`failed-login:${email}`, FAILED_LOGIN_TTL)
          }
          return null
        }

        if (user.twoFactorSecret) {
          const totpCode = credentials.totp as string | undefined
          if (!totpCode || totpCode.length !== 6) {
            if (redis) {
              await redis.incr(`failed-login:${email}`)
              await redis.expire(`failed-login:${email}`, FAILED_LOGIN_TTL)
            }
            return null
          }

          try {
            const isValidTotp = authenticator.verify({
              token: totpCode,
              secret: user.twoFactorSecret,
            })
            if (!isValidTotp) {
              if (redis) {
                await redis.incr(`failed-login:${email}`)
                await redis.expire(`failed-login:${email}`, FAILED_LOGIN_TTL)
              }
              return null
            }
          } catch {
            if (redis) {
              await redis.incr(`failed-login:${email}`)
              await redis.expire(`failed-login:${email}`, FAILED_LOGIN_TTL)
            }
            return null
          }
        }

        if (redis) {
          await redis.del(`failed-login:${email}`)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, include: { sellerProfile: true } })
        if (dbUser && (dbUser.role === "ADMIN" || dbUser.role === "BENDAHARA")) {
          return false
        }
        // Save the Google profile picture as image if needed, or just let it pass
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        
        // Check profile completeness for newly signed-in user
        const dbUser = await prisma.user.findUnique({ where: { id: user.id! }, include: { sellerProfile: true } })
        if (dbUser) {
          token.phone = dbUser.phone
          token.role = dbUser.role
          
          if (dbUser.role === "ADMIN" || dbUser.role === "BENDAHARA" || dbUser.role === "KETUA") {
            token.isProfileComplete = true
          } else {
            token.isProfileComplete = dbUser.isProfileComplete
          }
        }
      }
      
      // Allow session updates to trigger token updates
      if (trigger === "update" && session) {
        if (session.phone) token.phone = session.phone
        if (session.role) token.role = session.role
        if (session.isProfileComplete !== undefined) token.isProfileComplete = session.isProfileComplete
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        // Add custom fields to session.user
        ;(session.user as any).phone = token.phone
        ;(session.user as any).isProfileComplete = token.isProfileComplete
      }
      return session
    },
  },
})
