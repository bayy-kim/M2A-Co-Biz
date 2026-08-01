import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, type: true, title: true, message: true, link: true, readAt: true, createdAt: true },
    }),
    prisma.notification.count({ where: { userId: session.user.id, readAt: null } }),
  ])

  return NextResponse.json({
    notifications: notifications.map((n) => ({ ...n, read: !!n.readAt })),
    unreadCount,
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const id = body?.id as string | undefined

  if (id) {
    // Mark a single notification as read (only own)
    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { readAt: new Date() },
    })
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    })
  }

  return NextResponse.json({ ok: true })
}
