"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, safeEqual } from "@/lib/auth"

export async function login(username: string, password: string) {
  const adminUser = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD
  const secret = process.env.AUTH_SECRET

  if (!adminUser || !adminPassword || !secret) {
    return {
      success: false,
      error: "Server setup adhoora hai: .env mein ADMIN_USERNAME, ADMIN_PASSWORD aur AUTH_SECRET set karein",
    }
  }

  const userOk = safeEqual(username.trim(), adminUser)
  const passOk = safeEqual(password, adminPassword)

  if (!userOk || !passOk) {
    // Slow down brute-force attempts a little.
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { success: false, error: "Username ya password ghalat hai" }
  }

  const token = await createSessionToken(secret)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })

  return { success: true }
}

export async function logout() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  redirect("/login")
}
