import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/ketua": ["KETUA"],
  "/sekretaris": ["SEKRETARIS", "ADMIN"],
  "/seller": ["SELLER"],
  "/login": [],
  "/register": [],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const matchedRoute = Object.entries(roleRoutes).find(([route]) =>
    pathname.startsWith(route)
  )

  if (matchedRoute) {
    const allowedRoles = matchedRoute[1]

    if (allowedRoles.length > 0) {
      if (!session?.user) {
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }

      const userRole = session.user.role
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
