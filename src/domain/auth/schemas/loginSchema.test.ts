import { loginSchema, toTenant } from '@/domain/auth/schemas/loginSchema';

const errorsFor = (input: { email: string; password: string; organization?: string }) =>
  loginSchema
    .safeParse({ organization: 'hope', ...input })
    .error?.issues.map((issue) => issue.message) ?? [];

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(
      loginSchema.safeParse({
        organization: 'hope',
        email: 'helena.ruiz@example.com',
        password: 'secret',
      }).success
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

  it('requires the organization', () => {
    expect(errorsFor({ organization: '   ', email: 'a@b.co', password: 'secret' })).toEqual([
      'Organization is required',
    ]);
  });

  it('sends the organization trimmed and in lowercase', () => {
    expect(toTenant('  Hope ')).toBe('hope');
  });

  it('joins the words of the organization with hyphens', () => {
    expect(toTenant(' Two  Words ')).toBe('two-words');
  });
});
