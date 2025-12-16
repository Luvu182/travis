'use server';

import { signIn } from '@/auth';
import { checkRateLimit, LOGIN_RATE_LIMIT } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export interface SignupResult {
  success: boolean;
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
}

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return headersList.get('x-real-ip') || 'unknown';
}

export async function signup(_name: string, _email: string, _password: string): Promise<SignupResult> {
  const ip = await getClientIP();
  const rateLimitKey = `signup:${ip}`;

  const rateLimitResult = checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT);

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Quá nhiều lần thử. Vui lòng thử lại sau ${rateLimitResult.retryAfter} giây.`,
      rateLimited: true,
      retryAfter: rateLimitResult.retryAfter,
    };
  }

  try {
    // TODO: Implement actual signup logic
    // For now, just sign in with Google as fallback
    return {
      success: false,
      error: 'Đăng ký bằng email chưa được hỗ trợ. Vui lòng sử dụng Google.',
    };
  } catch {
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi đăng ký',
    };
  }
}

export async function signupWithGoogle() {
  await signIn('google', { redirectTo: '/dashboard' });
}
