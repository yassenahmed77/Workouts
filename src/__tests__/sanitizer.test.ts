import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeNotes, isValidPhoneNumber, sanitizeUrl } from '@/lib/sanitizer';

describe('Sanitizer Security Engine', () => {
  it('neutralizes malicious XSS script tags', () => {
    const dirty = '<script>alert("hacked")</script>John Doe';
    expect(sanitizeString(dirty)).toBe('John Doe');
  });

  it('neutralizes inline javascript protocols and event handlers', () => {
    const attack1 = 'javascript:alert(1)';
    expect(sanitizeString(attack1)).toBe('alert(1)');

    const attack2 = '<img src="x" onerror="stealCookies()" />Coach خالد';
    expect(sanitizeString(attack2)).toBe('Coach خالد');
  });

  it('strips non-printable ASCII control characters', () => {
    const dirty = 'Safe\u0000Text\u0007Here';
    expect(sanitizeString(dirty)).toBe('SafeTextHere');
  });

  it('handles null, undefined, and non-string types safely without throwing', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(12345)).toBe('');
    expect(sanitizeString({})).toBe('');
  });

  it('preserves clean multi-line coach notes while removing dangerous tags', () => {
    const notes = 'Goal: Build Muscle\n<script>bad()</script>Focus on bench press.';
    expect(sanitizeNotes(notes)).toBe('Goal: Build Muscle\nFocus on bench press.');
  });

  it('validates standard international and Egyptian phone numbers', () => {
    expect(isValidPhoneNumber('+201012345678')).toBe(true);
    expect(isValidPhoneNumber('01012345678')).toBe(true);
    expect(isValidPhoneNumber('+1234567890')).toBe(true);
    expect(isValidPhoneNumber('invalid-phone-abc')).toBe(false);
    expect(isValidPhoneNumber('')).toBe(true); // Optional
  });

  it('sanitizes external URLs and blocks javascript, data, and pseudo-protocols', () => {
    expect(sanitizeUrl('https://www.youtube.com/watch?v=123')).toBe('https://www.youtube.com/watch?v=123');
    expect(sanitizeUrl('http://example.com/guide.mp4')).toBe('http://example.com/guide.mp4');
    expect(sanitizeUrl('javascript:alert(document.cookie)')).toBe('');
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(sanitizeUrl('vbscript:msgbox("test")')).toBe('');
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    expect(sanitizeUrl('   ')).toBe('');
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
  });
});

