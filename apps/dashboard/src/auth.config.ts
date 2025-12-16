/**
 * Auth configuration for Edge runtime (middleware)
 * This config does NOT include database adapter or callbacks that require Node.js
 */
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider placeholder - actual auth happens in auth.ts
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // This authorize is only for type compatibility
      // Real authorization happens in auth.ts with database access
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isOnDashboard = pathname.startsWith('/dashboard');
      const isOnLogin = pathname === '/login';
      const isHomePage = pathname === '/';

      // Home page is public - allow everyone
      if (isHomePage) {
        return true;
      }

      // Dashboard requires authentication
      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        // Admin-only routes - check role from session (set in auth.ts session callback)
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
};
