// Edge-safe session helpers (Web Crypto only). Used by src/proxy.ts and server actions.

export const SESSION_COOKIE = "sms_session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, in seconds

const encoder = new TextEncoder()

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Constant-time string comparison for passwords and signatures.
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

// Token format: "<expiresAtMs>.<hmacSha256(expiresAtMs, AUTH_SECRET)>"
export async function createSessionToken(secret: string): Promise<string> {
  const expires = String(Date.now() + SESSION_MAX_AGE * 1000)
  return `${expires}.${await hmacHex(expires, secret)}`
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const [expires, signature] = token.split(".")
  if (!expires || !signature) return false

  const expected = await hmacHex(expires, secret)
  if (!safeEqual(signature, expected)) return false

  return Number(expires) > Date.now()
}
