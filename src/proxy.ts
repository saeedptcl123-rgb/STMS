import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth"

// Every page (and server action posted from a page) requires a valid session,
// except the login page itself and static assets.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = process.env.AUTH_SECRET
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const authed = Boolean(secret && token && (await verifySessionToken(token, secret)))

  if (pathname === "/login") {
    return authed ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next()
  }

  if (!authed) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
