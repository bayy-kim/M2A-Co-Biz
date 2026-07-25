import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/ketua": ["KETUA"],
  "/sekretaris": ["SEKRETARIS", "ADMIN"],
  "/seller": ["SELLER"],
  "/pesanan-saya": ["BUYER", "SELLER", "ADMIN", "KETUA", "SEKRETARIS"],
  "/login": [],
  "/register": [],
}

const authRequiredPrefixes = ["/checkout"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const matchedRoute = Object.entries(roleRoutes).find(([route]) =>
    pathname.startsWith(route)
  )

  const needsAuth = authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (needsAuth) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (matchedRoute) {
    const allowedRoles = matchedRoute[1]

    if (allowedRoles.length > 0 && !allowedRoles.includes(session?.user?.role)) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
