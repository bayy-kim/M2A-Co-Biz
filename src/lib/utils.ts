export function maskString(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value
  const visible = value.slice(-visibleChars)
  const masked = value.slice(0, -visibleChars).replace(/./g, "*")
  return masked + visible
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
