import { resetPasswordSchema } from '@/domain/auth/schemas/resetPasswordSchema';

describe('resetPasswordSchema', () => {
  it('accepts a strong password typed twice', () => {
    expect(
      resetPasswordSchema.safeParse({
        newPassword: 'N3w!password',
        confirmPassword: 'N3w!password',
      }).success
    ).toBe(true);
  });

  it('rejects a password that misses a rule', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'password',
      confirmPassword: 'password',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['newPassword']);
  });

  it('rejects a confirmation that does not match', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'N3w!password',
      confirmPassword: 'N3w!passwork',
    });

    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });
});
