import { z } from 'zod';

import { toIsoDate } from '@/utils/dateFormat';

export const MIN_DURATION = 5;
export const MAX_DURATION = 480;
export const MAX_REPEAT_EVERY = 52;
export const MAX_REPEAT_COUNT = 200;

const required = (message: string) =>
  z
    .string()
    .nullable()
    .refine((value) => value !== null && value !== '', message);

const wholeNumber = (value: string) => /^\d+$/.test(value.trim());

export const appointmentSchema = z
  .object({
    patientId: required('Choose a patient'),
    location: required('Choose a service location'),
    service: required('Choose a service'),
    payer: required('Choose a payer'),
    date: z.date(),
    startTime: z
      .date()
      .nullable()
      .refine((value) => value !== null, 'Choose a start time'),
    duration: z.string().refine((value) => {
      const minutes = Number(value);
      return wholeNumber(value) && minutes >= MIN_DURATION && minutes <= MAX_DURATION;
    }, `Enter ${MIN_DURATION}–${MAX_DURATION} minutes`),
    repeat: z.boolean(),
    repeatEvery: z.string(),
    repeatUnit: z.enum(['day', 'week']),
    repeatDays: z.array(z.number().int().min(0).max(6)),
    ends: z.enum(['never', 'on', 'after']),
    endsOn: z.date().nullable(),
    endsAfter: z.string(),
    notes: z.string().max(500, 'Keep notes under 500 characters'),
  })
  .superRefine((values, ctx) => {
    if (!values.repeat) return;
    const every = Number(values.repeatEvery);
    if (!wholeNumber(values.repeatEvery) || every < 1 || every > MAX_REPEAT_EVERY) {
      ctx.addIssue({
        code: 'custom',
        path: ['repeatEvery'],
        message: `Enter 1–${MAX_REPEAT_EVERY}`,
      });
    }
    if (values.repeatUnit === 'week' && values.repeatDays.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['repeatDays'], message: 'Pick at least one day' });
    }
    if (values.ends === 'on') {
      if (!values.endsOn) {
        ctx.addIssue({ code: 'custom', path: ['endsOn'], message: 'Choose an end date' });
      } else if (toIsoDate(values.endsOn) < toIsoDate(values.date)) {
        ctx.addIssue({
          code: 'custom',
          path: ['endsOn'],
          message: 'Can’t be before the first appointment',
        });
      }
    }
    if (values.ends === 'after') {
      const count = Number(values.endsAfter);
      if (!wholeNumber(values.endsAfter) || count < 1 || count > MAX_REPEAT_COUNT) {
        ctx.addIssue({
          code: 'custom',
          path: ['endsAfter'],
          message: `Enter 1–${MAX_REPEAT_COUNT}`,
        });
      }
    }
  });

export type AppointmentFormValues = z.input<typeof appointmentSchema>;
