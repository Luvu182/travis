/**
 * Role-Based Access Control (RBAC) utilities
 *
 * Role hierarchy: admin > user
 * - admin: Full access to all dashboard features
 * - user: Limited access (read-only for most features)
 */
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export type Role = 'admin' | 'user';

// Route permissions configuration
// Routes not listed default to requiring 'user' role (any authenticated user)
export const routePermissions: Record<string, Role> = {
  '/dashboard/settings': 'admin',
  '/dashboard/settings/users': 'admin',
  '/dashboard/settings/system': 'admin',
};

/**
 * Check if a role has permission for a given required role
 * admin has access to everything, user only has access to user-level
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  if (requiredRole === 'user') return true; // Any role can access user-level
  return userRole === 'admin';
}

/**
 * Get required role for a route
 * Defaults to 'user' if route not explicitly configured
 */
export function getRequiredRole(pathname: string): Role {
  // Check exact match first
  if (routePermissions[pathname]) {
    return routePermissions[pathname];
  }

  // Check prefix matches (for nested routes)
  for (const [route, role] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route + '/')) {
      return role;
    }
  }

  return 'user';
}

/**
 * Server action: Check if current user can access a route
 * Use in server components and API routes
 */
export async function canAccess(pathname: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const requiredRole = getRequiredRole(pathname);
  return hasRole(session.user.role, requiredRole);
}

/**
 * Server action: Require specific role, redirect to dashboard if unauthorized
 * Use at the top of server components that need role protection
 */
export async function requireRole(requiredRole: Role): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasRole(session.user.role, requiredRole)) {
    redirect('/dashboard?error=unauthorized');
  }
}

/**
 * Server action: Require admin role
 * Convenience wrapper for requireRole('admin')
 */
export async function requireAdmin(): Promise<void> {
  return requireRole('admin');
}

/**
 * Get current user's role from session
 * Returns null if not authenticated
 */
export async function getCurrentRole(): Promise<Role | null> {
  const session = await auth();
  return session?.user?.role ?? null;
}
