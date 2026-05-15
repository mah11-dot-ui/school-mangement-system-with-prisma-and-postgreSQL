// Edge-compatible auth config — NO Prisma, NO bcrypt, NO Node.js-only modules.
// Imported by middleware (Edge Runtime) and merged into auth.ts (Node.js).
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Providers are added in auth.ts (Node.js only)
  providers: [],
  callbacks: {
    // jwt / session callbacks are defined in auth.ts where types are fully available.
    // The middleware only needs the JWT to be readable, which NextAuth handles automatically
    // when AUTH_SECRET is set — no callback override needed here.
  },
} satisfies NextAuthConfig;
