import { loginSchema } from '@/domain/auth/schemas/loginSchema';

const errorsFor = (input: { email: string; password: string }) =>
  loginSchema.safeParse(input).error?.issues.map((issue) => issue.message) ?? [];

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(
      loginSchema.safeParse({ email: 'helena.ruiz@example.com', password: 'secret' }).success
    ).toBe(true);
  });

  it('requires both fields', () => {
    expect(errorsFor({ email: '', password: '' })).toEqual([
      'Email is required',
      'Password is required',
    ]);
  });

  it('rejects a malformed email', () => {
    expect(errorsFor({ email: 'helena.ruiz@', password: 'secret' })).toEqual([
      'Enter a valid email address',
    ]);
  });
});
