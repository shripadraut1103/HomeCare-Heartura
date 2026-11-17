import { formatCountdown, secondsLeft } from '@/domain/auth/hooks/useVerifyCodeForm';

describe('code countdown', () => {
  const now = Date.parse('2026-11-17T10:00:00Z');

  it('counts the seconds left until the code expires', () => {
    expect(secondsLeft('2026-11-17T10:10:00Z', now)).toBe(600);
    expect(secondsLeft('2026-11-17T09:59:00Z', now)).toBe(0);
    expect(secondsLeft(undefined, now)).toBe(0);
  });

  it('shows minutes and seconds', () => {
    expect(formatCountdown(600)).toBe('10:00');
    expect(formatCountdown(65)).toBe('1:05');
  });
});
