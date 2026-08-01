import type { Prisma } from "@prisma/client"

type TxClient = Prisma.TransactionClient

/**
 * Restore variant stock for an order that is cancelled/failed.
 * Variant name is embedded in service notes as "[Varian: <name>]".
 */
export async function restoreVariantStock(tx: TxClient, order: { serviceNotes: string | null; items: { productId: string; qty: number }[] }) {
  const variantMatch = order.serviceNotes?.match(/\[Varian:\s*(.*?)\]/)
  const variantName = variantMatch?.[1]?.trim()
  if (!variantName) return

  for (const item of order.items) {
    await tx.productVariant.updateMany({
      where: { productId: item.productId, name: variantName },
      data: { stock: { increment: item.qty } },
    })
  }
}
