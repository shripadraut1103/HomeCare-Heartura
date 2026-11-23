import { z } from 'zod';

import { loginSchema } from '@/domain/auth/schemas/loginSchema';

const PHONE_DIGITS = { min: 10, max: 15 };
const NAME_MAX = 150;

export const editProfileSchema = loginSchema.pick({ email: true }).extend({
  firstName: z.string().trim().min(1, 'First name is required').max(NAME_MAX),
  lastName: z.string().trim().min(1, 'Last name is required').max(NAME_MAX),
  phone: z
    .string()
    .trim()
    .min(1, 'Mobile phone is required')
    .refine((value) => {
      const digits = value.replace(/\D/g, '').length;
      return digits >= PHONE_DIGITS.min && digits <= PHONE_DIGITS.max;
    }, 'Enter a valid phone number'),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
