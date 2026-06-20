import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email & password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Enter your email and password.");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });

      if (!user) {
        throw new Error("No account found with that email.");
      }
      if (user.deactivated) {
        throw new Error("This account has been deactivated.");
      }

      const valid = await bcrypt.compare(credentials.password, user.password);
      if (!valid) {
        throw new Error("Incorrect password.");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

// OAuth is entirely optional — only registered if credentials are present
// in .env, so the app runs perfectly well with email/password alone.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  providers.push(
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/feed",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      // Allow client-side session.update() to refresh role/name/image after edits
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.picture = session.image ?? token.picture;
        token.role = session.role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth sign-ins, create a local User row on first login
      if (account?.provider !== "credentials") {
        const email = user.email?.toLowerCase();
        if (!email) return false;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          const created = await prisma.user.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              image: user.image || null,
              password: "", // OAuth users have no local password
              emailVerified: new Date(),
            },
          });
          (user as any).id = created.id;
          (user as any).role = created.role;
        } else {
          (user as any).id = existing.id;
          (user as any).role = existing.role;
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
