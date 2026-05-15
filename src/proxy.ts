import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "ACCOUNTANT";

const publicPaths = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
  "/api",
];

const restrictedRoutes: Record<string, Role[]> = {
  "/dashboard/students":   ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  "/dashboard/teachers":   ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/classes":    ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  "/dashboard/attendance": ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  "/dashboard/exams":      ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  "/dashboard/fees":       ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  "/dashboard/library":    ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"],
  "/dashboard/transport":  ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/hostel":     ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/settings":   ["SUPER_ADMIN", "ADMIN"],
};

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Get JWT token from cookie
  const secret = process.env.AUTH_SECRET!;
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  const token = req.cookies.get(cookieName)?.value;

  let userRole: Role | undefined;

  if (token) {
    try {
      const decoded = await decode({ token, secret, salt: cookieName });
      userRole = (decoded as { role?: Role })?.role;
    } catch {
      // Invalid token — treat as unauthenticated
    }
  }

  // Public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (userRole && pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Root
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(userRole ? "/dashboard" : "/login", req.url)
    );
  }

  // Dashboard — needs auth
  if (pathname.startsWith("/dashboard")) {
    if (!userRole) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check restricted routes
    for (const [route, allowed] of Object.entries(restrictedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowed.includes(userRole)) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        break;
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
