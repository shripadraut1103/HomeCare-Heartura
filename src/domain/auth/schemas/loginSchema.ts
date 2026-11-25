import { z } from 'zod';

export const loginSchema = z.object({
  organization: z.string().trim().min(1, 'Organization is required'),
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const toTenant = (organization: string) =>
  organization.trim().toLowerCase().replace(/\s+/g, '-');
