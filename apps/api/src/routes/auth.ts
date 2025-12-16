import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'crypto';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { env } from '@jarvis/config';
import {
  getAdminByEmail,
  getAdminById,
  updateLastLogin,
  saveRefreshToken,
  getValidRefreshToken,
  revokeRefreshToken,
} from '@jarvis/db';

const authRoutes = new Hono();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

// Password verification (SHA256 + salt for simplicity)
async function verifyPassword(hash: string, password: string): Promise<boolean> {
  const inputHash = createHash('sha256').update(password + env.JWT_SECRET).digest('hex');
  return hash === inputHash;
}

// Hash password for creating users
export function hashPassword(password: string): string {
  return createHash('sha256').update(password + env.JWT_SECRET).digest('hex');
}

// Hash refresh token for storage
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * POST /auth/login
 */
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const user = await getAdminByEmail(email);
  if (!user || !user.isActive) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const validPassword = await verifyPassword(user.passwordHash, password);
  if (!validPassword) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Generate access token
  const accessToken = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(jwtSecret);

  // Generate refresh token
  const refreshToken = randomBytes(32).toString('hex');
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await saveRefreshToken({
    userId: user.id,
    tokenHash: refreshTokenHash,
    expiresAt,
  });

  await updateLastLogin(user.id);

  // Set cookies
  const isProduction = env.NODE_ENV === 'production';

  setCookie(c, 'access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
  });

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
  });
});

/**
 * POST /auth/refresh
 */
authRoutes.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token');
  if (!refreshToken) {
    return c.json({ error: 'No refresh token' }, 401);
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await getValidRefreshToken(tokenHash);
  if (!storedToken) {
    return c.json({ error: 'Invalid refresh token' }, 401);
  }

  const user = await getAdminById(storedToken.userId);
  if (!user || !user.isActive) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Revoke old token
  await revokeRefreshToken(tokenHash);

  // Generate new tokens
  const accessToken = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(jwtSecret);

  const newRefreshToken = randomBytes(32).toString('hex');
  const newRefreshTokenHash = hashToken(newRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await saveRefreshToken({
    userId: user.id,
    tokenHash: newRefreshTokenHash,
    expiresAt,
  });

  const isProduction = env.NODE_ENV === 'production';

  setCookie(c, 'access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax',
    path: '/',
    maxAge: 15 * 60,
  });

  setCookie(c, 'refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
  });

  return c.json({ success: true });
});

/**
 * GET /auth/me
 */
authRoutes.get('/me', async (c) => {
  const accessToken = getCookie(c, 'access_token');
  if (!accessToken) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  try {
    const { payload } = await jwtVerify(accessToken, jwtSecret);
    const user = await getAdminById(payload.sub as string);
    if (!user || !user.isActive) {
      return c.json({ error: 'User not found' }, 401);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

/**
 * POST /auth/logout
 */
authRoutes.post('/logout', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token');
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await revokeRefreshToken(tokenHash);
  }

  deleteCookie(c, 'access_token', { path: '/' });
  deleteCookie(c, 'refresh_token', { path: '/api/auth' });

  return c.json({ success: true });
});

export { authRoutes };
