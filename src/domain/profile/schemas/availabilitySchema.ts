import { z } from 'zod';

import { toIsoDate, toTimeOfDay } from '@/utils/dateFormat';

const slotSchema = z.object({ start: z.date(), end: z.date() });

const daySchema = z.object({
  weekday: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  enabled: z.boolean(),
  slots: z.array(slotSchema),
});

export const availabilitySchema = z
  .object({
    startDate: z.date(),
    endDate: z.date().nullable(),
    days: z.array(daySchema).length(7),
  })
  .superRefine((values, ctx) => {
    if (values.endDate && toIsoDate(values.endDate) < toIsoDate(values.startDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Can’t be before the start date',
      });
    }

    values.days.forEach((day, dayIndex) => {
      if (!day.enabled) return;
      const slots = day.slots.map((slot, slotIndex) => ({
        slotIndex,
        start: toTimeOfDay(slot.start),
        end: toTimeOfDay(slot.end),
      }));
      for (const slot of slots) {
        if (slot.end <= slot.start) {
          ctx.addIssue({
            code: 'custom',
            path: ['days', dayIndex, 'slots', slot.slotIndex, 'end'],
            message: 'Must end after it starts',
          });
        }
      }
      const sorted = [...slots].sort((a, b) => a.start.localeCompare(b.start));
      sorted.forEach((slot, index) => {
        if (index > 0 && slot.start < sorted[index - 1].end) {
          ctx.addIssue({
            code: 'custom',
            path: ['days', dayIndex, 'slots', slot.slotIndex, 'start'],
            message: 'Overlaps another slot',
          });
        }
      });
    });
  });

export type AvailabilityFormValues = z.infer<typeof availabilitySchema>;
export type AvailabilitySlotValues = AvailabilityFormValues['days'][number]['slots'][number];
