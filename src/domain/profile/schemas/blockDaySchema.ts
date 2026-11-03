import { z } from 'zod';

import { toIsoDate, toTimeOfDay } from '@/utils/dateFormat';

export const blockDaySchema = z
  .object({
    title: z.string().trim().min(1, 'Enter a title'),
    startDate: z.date(),
    endDate: z.date(),
    specificHours: z.boolean(),
    startTime: z.date(),
    endTime: z.date(),
    notifyOffice: z.boolean(),
  })
  .refine((values) => toIsoDate(values.endDate) >= toIsoDate(values.startDate), {
    path: ['endDate'],
    message: 'Can’t be before the start date',
  })
  .refine(
    (values) =>
      !values.specificHours || toTimeOfDay(values.endTime) > toTimeOfDay(values.startTime),
    { path: ['endTime'], message: 'Must be after the start time' }
  );

export type BlockDayFormValues = z.infer<typeof blockDaySchema>;
