import { createHash, randomBytes } from 'crypto';

/** Generates a URL-safe random token (used for refresh tokens and password reset tokens). */
export function generateRandomToken(bytes = 48): string {
  return randomBytes(bytes).toString('hex');
}

/** Hashes a raw token with SHA-256 so only the hash is ever persisted. */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
