import { prisma } from "@/lib/db"

export async function createNotification(opts: {
  userId: string
  type: string
  title: string
  message: string
  link?: string | null
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        link: opts.link || null,
      },
    })
  } catch (e) {
    console.error("[notify] failed to create notification:", e)
  }
}

/** Resolve the owner user id of a seller profile (for order-related notifications). */
export async function sellerOwnerId(sellerProfileId: string): Promise<string | null> {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerProfileId },
    select: { userId: true },
  })
  return seller?.userId ?? null
}
