'use server';

import { signIn } from '@/auth';
import { checkRateLimit, resetRateLimit, LOGIN_RATE_LIMIT } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { AuthError } from 'next-auth';

export interface LoginResult {
  success: boolean;
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
}

/**
 * Get client IP from headers
 * Supports X-Forwarded-For for reverse proxy setups
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if multiple are present
    return forwardedFor.split(',')[0].trim();
  }
  return headersList.get('x-real-ip') || 'unknown';
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const ip = await getClientIP();
  const rateLimitKey = `login:${ip}`;

  // Check rate limit
  const rateLimitResult = checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT);

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Too many login attempts. Please try again in ${rateLimitResult.retryAfter} seconds.`,
      rateLimited: true,
      retryAfter: rateLimitResult.retryAfter,
    };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    // Reset rate limit on successful login
    resetRateLimit(rateLimitKey);

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            error: 'Invalid email or password',
          };
        default:
          return {
            success: false,
            error: 'An authentication error occurred',
          };
      }
    }

    // Rethrow unexpected errors
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/dashboard' });
}
