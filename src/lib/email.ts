import { Resend } from "resend"

// Graceful: if no API key configured, emails are skipped (no crash)
const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM || "M2A Co-Biz <onboarding@resend.dev>"
const resend = apiKey ? new Resend(apiKey) : null

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — email not sent:", subject)
    return
  }
  try {
    await resend.emails.send({ from, to, subject, html })
  } catch (e) {
    console.error("[email] failed to send:", subject, e)
  }
}

export function sendPasswordReset(to: string, name: string, resetUrl: string) {
  return send(
    to,
    "Reset Kata Sandi — M2A Co-Biz",
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e5e5;border-radius:12px">
      <h2 style="color:#004343;margin:0 0 12px">Halo ${name || "Pengguna"},</h2>
      <p style="color:#333;line-height:1.6">Kami menerima permintaan untuk mengatur ulang kata sandi akun M2A Co-Biz Anda.</p>
      <p style="margin:24px 0"><a href="${resetUrl}" style="display:inline-block;background:#004343;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Kata Sandi</a></p>
      <p style="color:#666;font-size:13px;line-height:1.6">Tautan berlaku selama 30 menit dan hanya bisa dipakai sekali. Jika Anda tidak meminta reset, abaikan email ini.</p>
      <p style="color:#999;font-size:12px;margin-top:24px">M2A Co-Biz — Al-Mubarok II, Banjarwaringin, Salopa</p>
    </div>`,
  )
}
