import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/api'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check auth for dashboard routes and root
  if (pathname.startsWith('/dashboard') || pathname === '/') {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'change-me-in-production-min-32-chars'
      );
      await jwtVerify(accessToken, secret);

      // Redirect root to dashboard
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return NextResponse.next();
    } catch {
      // Token expired or invalid - redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
