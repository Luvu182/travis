/**
 * Auth configuration for Edge runtime (middleware)
 * Shared callbacks (jwt, session, authorized) work in Edge
 * Database operations are in auth.ts (Node.js only)
 */
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

// Type augmentation for role in session
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

// JWT type is extended via next-auth module augmentation
// The JWT token will have id and role from the jwt callback

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
    // JWT callback runs in both Edge (middleware) and Node.js (API routes)
    // This ensures role is always available in the token
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Session callback transfers token data to session
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'admin' | 'user') || 'user';
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isOnDashboard = pathname.startsWith('/dashboard');
      const isOnAdmin = pathname.startsWith('/admin');
      const isOnLogin = pathname === '/login';
      const isHomePage = pathname === '/';

      // Home page is public
      if (isHomePage) {
        return true;
      }

      // Admin routes - require admin role
      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        if (auth?.user?.role !== 'admin') {
          return Response.redirect(new URL('/dashboard?error=unauthorized', request.nextUrl));
        }
        return true;
      }

      // Dashboard requires authentication (any role)
      if (isOnDashboard) {
        if (!isLoggedIn) return false;
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
