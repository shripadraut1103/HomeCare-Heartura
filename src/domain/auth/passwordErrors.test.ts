import { serviceError } from '@/config/ApiError';
import { newPasswordError } from '@/domain/auth/passwordErrors';

describe('newPasswordError', () => {
  it('lists the password rules the server says are not met', () => {
    const result = serviceError('PASSWORD_POLICY', 'Password too weak.', 400, {
      password: ['This password is too short.', 'This password is too common.'],
    });

    expect(newPasswordError(result)).toBe(
      'This password is too short.\nThis password is too common.'
    );
  });

  it('falls back to the server message for a policy error without details', () => {
    expect(newPasswordError(serviceError('PASSWORD_POLICY', 'Password too weak.', 400))).toBe(
      'Password too weak.'
    );
  });

  it('reads new_password field errors', () => {
    const result = serviceError('VALIDATION_ERROR', 'Invalid input.', 400, {
      fields: { new_password: ['Too similar to your email.'] },
    });

    expect(newPasswordError(result)).toBe('Too similar to your email.');
  });

  it('ignores errors that are not about the new password', () => {
    expect(
      newPasswordError(serviceError('CURRENT_PASSWORD_INVALID', 'Wrong password.', 400))
    ).toBeUndefined();
  });
});
