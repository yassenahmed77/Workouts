/**
 * Workouts Pro — Security & Input Sanitization Engine
 * 
 * Provides defense against Cross-Site Scripting (XSS), script injection,
 * and malicious payloads in user-entered fields (names, notes, feedback).
 */

/**
 * Strips script tags with their content, style blocks, all HTML tags,
 * dangerous protocols, inline event handlers, and non-printable control characters.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    // 1. Strip <script>...</script> including all malicious contents inside
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 2. Strip <style>...</style> including CSS payloads
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // 3. Strip all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // 4. Strip dangerous pseudo-protocols
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    // 5. Strip inline DOM event handlers (e.g. onerror=, onclick=)
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // 6. Strip non-printable control characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
}

export const sanitizeText = sanitizeString;

/**
 * Sanitizes multi-line text (such as coach notes or check-in remarks),
 * preserving clean whitespace and line breaks while neutralizing HTML/XSS threats.
 */
export function sanitizeNotes(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    // 1. Strip <script>...</script> including internal contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 2. Strip <style>...</style>
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // 3. Strip remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // 4. Strip dangerous protocols
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    // 5. Strip inline DOM event handlers
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // 6. Strip control characters but preserve \r, \n, \t for readable notes
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .trim();
}

/**
 * Validates international or Egyptian phone numbers safely.
 */
export function isValidPhoneNumber(phone?: string): boolean {
  if (!phone) return true; // Optional field
  // Accepts standard international formats: +201..., 01..., etc.
  const phoneRegex = /^(\+?[0-9]{8,15})$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Safely sanitizes external URLs (e.g. video guides, YouTube links, social profiles).
 * Strictly requires http: or https: schemes and strips non-printable control characters,
 * completely neutralizing javascript:, data:, vbscript:, and malicious URI schemes.
 */
export function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Block dangerous pseudo-protocols before URL parsing
  if (/^(javascript|vbscript|data|file):/i.test(trimmed)) {
    return '';
  }

  // Strip non-printable control characters
  const clean = trimmed.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  try {
    const url = new URL(clean);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    return '';
  }

  return '';
}
