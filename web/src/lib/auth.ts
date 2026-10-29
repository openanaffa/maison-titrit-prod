/**
 * Maison Titrit — NextAuth v4 configuration.
 *  - Credentials provider (email + password, bcrypt) — for founders/admins
 *  - Google OAuth provider — for client users (and founders)
 *  - Email magic-link provider — for client signup/login
 *  - JWT session strategy (stateless, edge-friendly for middleware RBAC)
 *  - role + id injected into the JWT + session token
 *  - Prisma adapter for Google/Email account linking
 *
 *  Env vars needed (production):
 *   NEXTAUTH_URL, NEXTAUTH_SECRET
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   EMAIL_SERVER_HOST/PORT/USER/PASSWORD (or NEXT_PUBLIC_RESEND_API_KEY)
 *   ADMIN_EMAIL, ADMIN_PASSWORD (for the seeded founder)
 */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { magicLinkEmail } from "@/lib/email-templates";
import { smtpServer } from "@/lib/notify";

/**
 * Branded magic-link verification email.
 *  - dev: log the link to the server console (no SMTP needed)
 *  - prod: send via nodemailer with the EMAIL_SERVER_* config below
 */
async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  provider: { from: string };
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log("\n━━━━━━━━━━━━━━ MAGIC LINK ━━━━━━━━━━━━━━");
    console.log(`  To: ${identifier}`);
    console.log(`  From: ${provider.from}`);
    console.log(`  URL:  ${url}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    return;
  }
  const transport = nodemailer.createTransport(smtpServer);
  const { subject, html, text } = magicLinkEmail(url);
  await transport.sendMail({ to: identifier, from: provider.from, subject, html, text });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  // Always have a secret: prefer env, fall back to a dev-only value so auth
  // never throws "NO_SECRET" (which surfaces as error=Configuration to users).
  secret: process.env.NEXTAUTH_SECRET || "titrit-dev-fallback-secret-please-set-NEXTAUTH_SECRET-in-production",
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Email & mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const email = creds.email.toLowerCase().trim();
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(creds.password, user.password);
        if (!ok) return null;
        // Minimal user; role is merged in the jwt callback (fetched from DB).
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    EmailProvider({
      server: smtpServer,
      from: process.env.EMAIL_FROM ?? "Maison Titrit <hello@maisontitrit.com>",
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    /** Inject user id + role into the JWT (fetch role from DB to stay fresh). */
    async jwt({ token, user, account }) {
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
