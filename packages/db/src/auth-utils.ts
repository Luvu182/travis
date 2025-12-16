import { scrypt, randomBytes, timingSafeEqual, ScryptOptions } from 'crypto';

// scrypt parameters (OWASP recommended)
const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS: ScryptOptions = {
  N: 16384, // cost
  r: 8,     // block size
  p: 1,     // parallelization
};

function scryptAsync(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/**
 * Hash password with scrypt (Node.js crypto built-in)
 * Format: salt:hash (both hex encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verify password against hash (constant-time comparison)
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const storedHashBuffer = Buffer.from(hashHex, 'hex');

  const hash = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return timingSafeEqual(hash, storedHashBuffer);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be 128 characters or less' };
  }
  return { valid: true };
}
