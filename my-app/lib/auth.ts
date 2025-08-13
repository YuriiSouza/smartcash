// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import GitHubProvider from "next-auth/providers/github"; // opcional
import { prisma } from "@/lib/prisma"; // seu client Prisma
import { PrismaAdapter } from "@auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // opcional: allowDangerousEmailAccountLinking: true
    }),
    // GitHubProvider({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),
  ],
  session: { strategy: "jwt" }, // com Mongo, JWT costuma ser mais simples
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // coloca o id do User do Prisma no token
        token.userId = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.userId) {
        (session.user as any).id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // sua página de login
  },
  // debug: process.env.NODE_ENV === "development",
};
