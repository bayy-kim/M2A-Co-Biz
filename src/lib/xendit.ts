import { Invoice, Payout } from "xendit-node"
import type { XenditOpts } from "xendit-node"

function getOpts(): XenditOpts {
  const secretKey = process.env.XENDIT_SECRET_KEY
  if (!secretKey) throw new Error("XENDIT_SECRET_KEY is required")
  return { secretKey }
}

export async function createInvoice(params: {
  externalId: string
  amount: number
  payerEmail?: string
  description?: string
}) {
  const invoiceApi = new Invoice(getOpts())
  return invoiceApi.createInvoice({
    data: {
      externalId: params.externalId,
      amount: params.amount,
      payerEmail: params.payerEmail,
      description: params.description,
      currency: "IDR",
    },
  })
}

export async function createDisbursement(params: {
  idempotencyKey: string
  referenceId: string
  amount: number
  channelCode: string
  accountNumber: string
  accountHolderName: string
  description?: string
}) {
  const payoutApi = new Payout(getOpts())
  return payoutApi.createPayout({
    idempotencyKey: params.idempotencyKey,
    data: {
      referenceId: params.referenceId,
      amount: params.amount,
      channelCode: params.channelCode,
      channelProperties: {
        accountNumber: params.accountNumber,
        accountHolderName: params.accountHolderName,
      },
      description: params.description,
      currency: "IDR",
    },
  })
}

export function verifyWebhookSignature(token: string): boolean {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN
  if (!expected) throw new Error("XENDIT_WEBHOOK_TOKEN is required")
  return token === expected
}
