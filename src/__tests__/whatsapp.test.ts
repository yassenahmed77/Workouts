import { describe, it, expect } from 'vitest';
import { 
  formatWhatsAppPhone, 
  buildWhatsAppFormCheckUrl, 
  buildWhatsAppRenewalAlertUrl, 
  buildWhatsAppCheckInReminderUrl, 
  buildWhatsAppCompetitorUpdateUrl 
} from '@/lib/whatsapp';

describe('whatsapp utility — Phone Normalization & Safe Link Generation', () => {
  it('normalizes Egyptian local and international phone numbers correctly', () => {
    // Egyptian 11 digits: 01012345678 -> 201012345678
    expect(formatWhatsAppPhone('01012345678')).toBe('201012345678');
    expect(formatWhatsAppPhone('01198765432')).toBe('201198765432');

    // Egyptian formatted with spaces/dashes: +20 10 1234-5678
    expect(formatWhatsAppPhone('+20 10 1234-5678')).toBe('201012345678');

    // International prefix with 00: 00966501234567 -> 966501234567
    expect(formatWhatsAppPhone('00966501234567')).toBe('966501234567');

    // Empty or invalid input
    expect(formatWhatsAppPhone('')).toBe('');
    expect(formatWhatsAppPhone(undefined)).toBe('');
  });

  it('generates properly encoded Form Check review URLs', () => {
    const url = buildWhatsAppFormCheckUrl({
      phone: '01012345678',
      clientName: 'Yassen',
      exerciseName: 'Barbell Squat',
      recordedAt: '2026-10-01',
      setDetails: '120kg x 6',
      coachFeedback: 'Keep chest upright on the ascent.'
    });

    expect(url.startsWith('https://wa.me/201012345678?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Barbell Squat'));
    expect(url).toContain(encodeURIComponent('Keep chest upright on the ascent.'));
  });

  it('generates fallback api.whatsapp.com URL when phone is missing', () => {
    const url = buildWhatsAppFormCheckUrl({
      clientName: 'Athlete',
      exerciseName: 'Bench Press',
      recordedAt: '2026-10-01'
    });

    expect(url.startsWith('https://api.whatsapp.com/send?text=')).toBe(true);
  });

  it('interpolates custom templates cleanly in buildWhatsAppRenewalAlertUrl', () => {
    const url = buildWhatsAppRenewalAlertUrl({
      phone: '01099998888',
      clientName: 'Captain Tarek',
      planName: 'VIP Coaching',
      endDate: '2026-10-15',
      daysLeft: 3,
      coachName: 'Coach Ramy',
      brandName: 'Iron Dynasty',
      customTemplate: 'Hey {clientName}! Your {planName} with {coachName} at {brandName} ends in {daysLeft} days ({endDate}).'
    });

    expect(url.startsWith('https://wa.me/201099998888?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Hey Captain Tarek!'));
    expect(url).toContain(encodeURIComponent('Coach Ramy'));
    expect(url).toContain(encodeURIComponent('3 days'));
  });

  it('generates check-in reminder and competitor update URLs with safe characters', () => {
    const checkInUrl = buildWhatsAppCheckInReminderUrl({
      phone: '01234567890',
      clientName: 'Omar',
      lastCheckInDate: '2026-09-24',
      coachName: 'Coach Big Ramy'
    });
    expect(checkInUrl).toContain('wa.me/201234567890');
    expect(checkInUrl).toContain(encodeURIComponent('Omar'));

    const competitorUrl = buildWhatsAppCompetitorUpdateUrl({
      phone: '01511112222',
      clientName: 'Mahmoud',
      targetShow: 'NPC Egypt Pro',
      daysOut: 14,
      prepPhase: 'Peak Week',
      coachNotes: 'Sodium load starts tomorrow.'
    });
    expect(competitorUrl).toContain('wa.me/201511112222');
    expect(competitorUrl).toContain(encodeURIComponent('NPC Egypt Pro'));
    expect(competitorUrl).toContain(encodeURIComponent('14 Days Out'));
  });
});
