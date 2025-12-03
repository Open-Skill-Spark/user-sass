import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard")
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/reset-password")

  if ((isProtectedRoute || isAdminRoute) && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionCookie) {
    try {
      const payload = await decrypt(sessionCookie)
      
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      if (isAdminRoute && payload.user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      // Invalid session
      if (isProtectedRoute || isAdminRoute) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
