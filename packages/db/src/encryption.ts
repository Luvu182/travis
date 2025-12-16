/**
 * Encryption utilities for sensitive data (API keys, bot tokens)
 * Uses AES-256-GCM for authenticated encryption
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment
 * Falls back to JWT_SECRET if ENCRYPTION_KEY not set
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY or JWT_SECRET must be at least 32 characters');
  }
  return key;
}

/**
 * Derive a key from the master key and salt
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return scryptSync(masterKey, salt, KEY_LENGTH);
}

/**
 * Encrypt sensitive data
 * @param plaintext - Data to encrypt
 * @returns Encrypted string (base64: salt:iv:authTag:ciphertext)
 */
export function encrypt(plaintext: string): string {
  const masterKey = getEncryptionKey();
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(masterKey, salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  // Format: salt:iv:authTag:ciphertext (all base64)
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted,
  ].join(':');
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted string from encrypt()
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedData: string): string {
  const masterKey = getEncryptionKey();
  const parts = encryptedData.split(':');

  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }

  const [saltB64, ivB64, authTagB64, ciphertext] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const key = deriveKey(masterKey, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Check if a string is already encrypted (has our format)
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  if (parts.length !== 4) return false;

  try {
    // Check if all parts are valid base64
    parts.forEach((part) => {
      Buffer.from(part, 'base64');
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypt if not already encrypted
 */
export function ensureEncrypted(value: string): string {
  if (isEncrypted(value)) return value;
  return encrypt(value);
}

/**
 * Safely decrypt (returns null if decryption fails)
 */
export function safeDecrypt(encryptedData: string): string | null {
  try {
    return decrypt(encryptedData);
  } catch {
    return null;
  }
}

/**
 * Mask sensitive data for display (show first/last 4 chars)
 */
export function maskSensitive(value: string): string {
  if (value.length <= 8) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, 4)}${'*'.repeat(value.length - 8)}${value.slice(-4)}`;
}
