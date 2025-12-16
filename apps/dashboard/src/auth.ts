import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { verifyAuthUser, findOrCreateOAuthUser } from '@jarvis/db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt', // JWT required for Credentials provider
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: { signIn: '/login' },
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
    async signIn({ user, account }) {
      // Handle OAuth sign in - create/update user in database
      if (account?.provider === 'google' && user.email) {
        const dbUser = await findOrCreateOAuthUser({
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });
        // Attach db user data to the user object
        user.id = dbUser.id;
        user.role = dbUser.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      // On sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer data from JWT to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'admin' | 'user') || 'user';
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isOnDashboard = pathname.startsWith('/dashboard');
      const isOnLogin = pathname === '/login';

      // Homepage is public
      if (pathname === '/') {
        return true;
      }

      // Dashboard requires authentication
      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        // Admin-only routes
        const adminRoutes = ['/dashboard/settings'];
        const requiresAdmin = adminRoutes.some((route) => pathname.startsWith(route));

        if (requiresAdmin && auth?.user?.role !== 'admin') {
          return Response.redirect(new URL('/dashboard?error=unauthorized', request.nextUrl));
        }

        return true;
      }

      // Redirect logged-in users from login page
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }

      return true;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  trustHost: true,
});

// Type augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: 'admin' | 'user';
    };
  }

  interface User {
    role?: 'admin' | 'user';
  }
}
