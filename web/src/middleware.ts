/**
 * Maison Titrit — edge middleware for route protection.
 *  /makteb/*      → staff only (FOUNDER, ADMIN, MANAGER)
 *  /compte/*      → any authenticated user
 *  /api/admin/*   → staff only
 *  /api/checkout  → authenticated (CUSTOMER or staff)
 */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  pages: { signIn: "/auth/signin" },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      const role = token?.role as string | undefined;

      // /makteb and /api/admin — staff only
      if (path.startsWith("/makteb") || path.startsWith("/api/admin")) {
        return (
          !!token &&
          (role === "FOUNDER" || role === "ADMIN" || role === "MANAGER")
        );
      }

      // /compte — any logged-in user
      if (path.startsWith("/compte")) {
        return !!token;
      }

      // /api/checkout — guest checkout allowed (order created without userId)
      // /api/compte/* — requires auth
      if (path.startsWith("/api/compte")) {
        return !!token;
      }

      return true; // public by default
    },
  },
});

export const config = {
  // Match the protected routes + their static assets exclusion
  matcher: ["/makteb/:path*", "/compte/:path*", "/api/admin/:path*", "/api/compte/:path*"],
};
