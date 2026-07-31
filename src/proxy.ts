import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/api/admin": ["ADMIN"],
  "/ketua": ["KETUA"],
  "/bendahara": ["BENDAHARA", "ADMIN"],
  "/seller": ["SELLER", "ADMIN", "BENDAHARA"], // Allow Admin/Bendahara to print seller receipts too
  "/dashboard-buyer": ["BUYER", "SELLER", "ADMIN", "KETUA", "BENDAHARA"],
  "/pesanan-saya": ["BUYER", "SELLER", "ADMIN", "KETUA", "BENDAHARA"],
  "/login": [],
  "/register": [],
  "/lengkapi-profil": [],
  "/aichat": [],
  "/aichat-bendahara": ["BENDAHARA", "ADMIN"],
}

const authRequiredPrefixes = ["/checkout", "/aichat", "/aichat-bendahara"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const matchedRoute = Object.entries(roleRoutes).find(([route]) =>
    pathname.startsWith(route)
  )

  const needsAuth = authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix))

  // Redirect to login if auth is needed
  if (needsAuth) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Profile completion enforcement (skip for staff roles — ADMIN, BENDAHARA, KETUA)
  if (session?.user && !session.user.isProfileComplete && !pathname.startsWith("/lengkapi-profil") && !pathname.startsWith("/api/auth")) {
    // Staff roles bypass — they can access their dashboard without completing profile
    if (session.user.role === "ADMIN" || session.user.role === "BENDAHARA" || session.user.role === "KETUA") {
      return NextResponse.next()
    }

    // Force user to complete their profile before accessing dashboard or protected routes
    const isProtectedRoute = needsAuth || (matchedRoute && matchedRoute[1].length > 0)
    if (isProtectedRoute) {
      const completionUrl = new URL("/lengkapi-profil", req.url)
      completionUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(completionUrl)
    }
  }

  if (matchedRoute) {
    const allowedRoles = matchedRoute[1]

    if (allowedRoles.length > 0 && !allowedRoles.includes(session?.user?.role)) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
