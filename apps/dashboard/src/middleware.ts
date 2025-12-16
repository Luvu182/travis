export { auth as middleware } from '@/auth';

export const config = {
  matcher: [
    // Match all dashboard routes
    '/dashboard/:path*',
    // Match root for redirect
    '/',
    // Match login route for redirect if already logged in
    '/login',
  ],
};
