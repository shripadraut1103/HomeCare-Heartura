import { z } from 'zod';

import { loginSchema } from '@/domain/auth/schemas/loginSchema';

const PHONE_DIGITS = { min: 10, max: 15 };

export const editProfileSchema = loginSchema.pick({ email: true }).extend({
  phone: z
    .string()
    .trim()
    .min(1, 'Mobile phone is required')
    .refine((value) => {
      const digits = value.replace(/\D/g, '').length;
      return digits >= PHONE_DIGITS.min && digits <= PHONE_DIGITS.max;
    }, 'Enter a valid phone number'),
  homeAddress: z.string().trim().min(1, 'Home address is required'),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
