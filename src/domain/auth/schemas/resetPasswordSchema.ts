import { z } from 'zod';

import {
  confirmPasswordField,
  newPasswordField,
} from '@/domain/profile/schemas/changePasswordSchema';

export const resetPasswordSchema = z
  .object({
    newPassword: newPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((values) => values.confirmPassword === values.newPassword, {
    path: ['confirmPassword'],
    message: 'Passwords don’t match',
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
