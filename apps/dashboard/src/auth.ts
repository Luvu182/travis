import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authAdapter, verifyAuthUser, getAdminById } from '@jarvis/db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: authAdapter,
  session: {
    strategy: 'database', // Database sessions for immediate revocation
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: { signIn: '/login' },
  providers: [
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
    async session({ session, user }) {
      // With database strategy, user comes from DB (not token)
      if (session.user) {
        session.user.id = user.id;
        // Fetch role from adminUsers table (adapter doesn't include custom fields)
        const dbUser = await getAdminById(user.id);
        session.user.role = dbUser?.role || 'user';
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isOnDashboard = pathname.startsWith('/dashboard');
      const isOnLogin = pathname === '/login';

      // Redirect root to dashboard
      if (pathname === '/') {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', request.nextUrl));
        }
        return Response.redirect(new URL('/login', request.nextUrl));
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
