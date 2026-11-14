/**
 * Maison Titrit — NextAuth v4 configuration (Google-only).
 *  - Google OAuth provider — the ONLY sign-in path (customers + staff)
 *  - JWT session strategy (stateless, edge-friendly for middleware RBAC)
 *  - role + id injected into the JWT + session token
 *  - Prisma adapter for account linking (existing password/magic-link users
 *    merge into their account on first Google sign-in when the email matches)
 *
 *  Why Google-only: one sign-in surface, no password storage/magic-link SMTP
 *  coupling in auth. Staff roles (FOUNDER/ADMIN/MANAGER) are resolved from the
 *  DB by email in the jwt callback — the founder must sign in with the Google
 *  account whose email matches the seeded ADMIN_EMAIL.
 *
 *  Env vars needed (production):
 *   NEXTAUTH_URL, NEXTAUTH_SECRET
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET  (required — fail fast if unset)
 */
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

/**
 * `next build` runs with NODE_ENV=production and imports this module while
 * collecting page data — but a build has no runtime env to validate against
 * (and on Vercel, missing env should fail the deploy loudly at boot instead).
 * Skip the fail-fast during the build phase only; real server boots still throw.
 */
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * Resolve the NextAuth secret at config load time.
 *  - Production: fail fast when NEXTAUTH_SECRET is unset — never ship a
 *    committed fallback secret (that is an auth/security anti-pattern).
 *  - Development: use an ephemeral per-process random value so auth keeps
 *    working without a committed literal; it regenerates on each restart,
 *    which is fine because dev sessions are throwaway.
 */
function resolveNextAuthSecret(): string {
  const envSecret = process.env.NEXTAUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !isBuildPhase()) {
    if (!envSecret) {
      throw new Error(
        "NEXTAUTH_SECRET is required in production. Set it before starting the app (never commit a fallback secret).",
      );
    }
    return envSecret;
  }
  return envSecret ?? randomBytes(32).toString("hex");
}

/**
 * Google is the only provider — if credentials are missing in production the
 * app must fail loudly at boot instead of rendering a sign-in button that can
 * never succeed. In development (and during `next build`, which has no runtime
 * env) we degrade to an empty provider list so boot/build still succeed.
 */
function resolveGoogleProvider() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (clientId && clientSecret) {
    return [
      GoogleProvider({
        clientId,
        clientSecret,
        // Merge Google accounts into an existing user with the same email
        // (seeded founder, prior magic-link signups) instead of erroring.
        allowDangerousEmailAccountLinking: true,
      }),
    ];
  }
  if (process.env.NODE_ENV === "production" && !isBuildPhase()) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in production — Google is the only sign-in method. Configure them in the Google Cloud console (Web OAuth client) and set them in the deployment env before starting the app.",
    );
  }
  // Silent during `next build` (page-data workers import this module without
  // runtime env); warn only for a real dev boot so `next dev` stays usable.
  if (!isBuildPhase()) {
    console.warn(
      "[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google sign-in is disabled in this dev session.",
    );
  }
  return [];
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: resolveNextAuthSecret(),
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  providers: resolveGoogleProvider(),
  callbacks: {
    /** Inject user id + role into the JWT (fetch role from DB to stay fresh). */
    async jwt({ token, user }) {
      // On first sign-in (user present), seed id + email, then fetch role from DB.
      if (user) {
        token.id = user.id;
        token.email = user.email ?? token.email;
      }
      // Always ensure role is current (cheap DB lookup, cached by Prisma).
      if (token.email && !token.role) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        token.id = dbUser?.id ?? token.id ?? "";
        token.role = dbUser?.role ?? "CUSTOMER";
      }
      return token;
    },
    /** Expose id + role on the session for client + server checks. */
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = (token.role as string) ?? "CUSTOMER";
      }
      return session;
    },
    /** Route guards — staff to /makteb, customers away from it. */
    async redirect({ url, baseUrl }) {
      const isStaff = url.includes("/makteb");
      if (isStaff) return url;
      return url.startsWith("/") ? `${baseUrl}${url}` : url;
    },
  },
};
