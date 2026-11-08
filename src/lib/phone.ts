// Turns "0336 2522990" or "+92 336..." into the international digits WhatsApp needs ("923362522990").
export function toWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  if (digits.startsWith("0")) digits = "92" + digits.slice(1)
  return /^\d{10,15}$/.test(digits) ? digits : null
}
