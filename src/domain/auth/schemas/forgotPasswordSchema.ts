import { z } from 'zod';

import { loginSchema } from '@/domain/auth/schemas/loginSchema';

export const forgotPasswordSchema = loginSchema.pick({ email: true });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
