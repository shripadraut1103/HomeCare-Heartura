import { serviceError } from '@/config/ApiError';
import { RESET_CODE_EXPIRED_MESSAGE, resetCodeOutcome } from '@/domain/auth/resetCodeOutcome';

describe('resetCodeOutcome', () => {
  it('moves on with the reset token', () => {
    expect(resetCodeOutcome({ data: { reset_token: 'token-1' } })).toEqual({
      kind: 'verified',
      token: 'token-1',
    });
  });

  it('lets the user try again after a wrong code', () => {
    expect(
      resetCodeOutcome(serviceError('RESET_CODE_INVALID', 'That code is not right.', 400))
    ).toEqual({ kind: 'invalid', message: 'That code is not right.' });
  });

  it('asks for a new code when the code expired or was used up', () => {
    expect(resetCodeOutcome(serviceError('RESET_CODE_EXPIRED', 'Expired.', 400))).toEqual({
      kind: 'expired',
      message: RESET_CODE_EXPIRED_MESSAGE,
    });
  });

  it('shows other errors without blocking the code', () => {
    expect(resetCodeOutcome(serviceError('NETWORK_ERROR', 'Offline.'))).toEqual({
      kind: 'invalid',
      message: 'Offline.',
    });
  });
});
