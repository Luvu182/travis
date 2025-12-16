/**
 * Auth configuration for Node.js runtime (API routes, server components)
 * Extends auth.config.ts and adds database-specific operations
 */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { verifyAuthUser, findOrCreateOAuthUser } from '@jarvis/db';
import { authConfig } from './auth.config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await verifyAuthUser(parsed.data.email, parsed.data.password);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Override signIn to handle database operations (Node.js only)
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = await findOrCreateOAuthUser({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });
          user.id = dbUser.id;
          user.role = dbUser.role;
        } catch (error) {
          console.error('[Auth] Failed to create/find OAuth user:', error);
          return false;
        }
      }
      return true;
    },
  },
});
