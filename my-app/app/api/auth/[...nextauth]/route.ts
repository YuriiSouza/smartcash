import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || ''
    }),
  ],
  callbacks: {
    async signIn({ user }: any) {
      return true;
    },
    async session({ session, token, user }: any) {
      return session;
    },
  }
};

const handler = NextAuth(authOptions);

// E então se exporta as funções GET e POST
// que o Next.js App Router espera.
export { handler as GET, handler as POST };
