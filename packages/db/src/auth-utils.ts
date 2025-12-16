import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash password with bcrypt (12 rounds)
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash (constant-time comparison)
 * @param password - Plain text password
 * @param hash - Stored password hash
 * @returns True if match
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength (basic requirements)
 * @param password - Plain text password
 * @returns Validation result with message
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (password.length > 72) {
    // bcrypt max input length
    return { valid: false, message: 'Password must be 72 characters or less' };
  }
  return { valid: true };
}
