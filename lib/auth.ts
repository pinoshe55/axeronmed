import bcryptjs from "bcryptjs";
import crypto from "crypto";

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Generate a cryptographically secure random token (32 bytes, base64-url encoded)
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Hash a token using SHA256 (for storage)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Validate token by comparing plaintext with stored hash
 */
export function validateToken(plainToken: string, storedHash: string): boolean {
  const computedHash = hashToken(plainToken);
  return computedHash === storedHash;
}

/**
 * Check if a token has expired (24 hours by default)
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Generate token expiration time (24 hours from now)
 */
export function getTokenExpirationTime(hoursFromNow: number = 24): number {
  return Date.now() + hoursFromNow * 60 * 60 * 1000;
}

/**
 * Generate a UUID-like string (random hex ID)
 */
export function generateUserId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (minimum 8 chars, at least one number/symbol)
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Parola en az 8 karakter olmalıdır");
  }
  if (!/\d/.test(password)) {
    errors.push("Parola en az bir rakam içermelidir");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Parola en az bir özel karakter içermelidir");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
