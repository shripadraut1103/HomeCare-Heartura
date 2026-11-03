import { z } from 'zod';

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  {
    id: 'case',
    label: 'An uppercase and a lowercase letter',
    test: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value),
  },
  { id: 'number', label: 'A number', test: (value: string) => /\d/.test(value) },
  {
    id: 'symbol',
    label: 'A symbol, like ! # or @',
    test: (value: string) => /[^A-Za-z0-9\s]/.test(value),
  },
] as const;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(1, 'Enter a new password')
      .refine(
        (value) => PASSWORD_RULES.every((rule) => rule.test(value)),
        'Meet every requirement below'
      ),
    confirmPassword: z.string().min(1, 'Enter the new password again'),
  })
  .refine((values) => values.confirmPassword === values.newPassword, {
    path: ['confirmPassword'],
    message: 'Passwords don’t match',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
