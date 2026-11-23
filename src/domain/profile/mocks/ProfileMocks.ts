import type {
  AvailabilityRange,
  BlockedDay,
  SettingsSummary,
} from '@/domain/profile/interfaces/ProfileInterfaces';

/**
 * TEMPORARY: provider profile and settings until the API exists.
 * Delete this file once the profile slice and `useSettingsSummary` read from the service.
 */

export const MOCK_SETTINGS_SUMMARY: SettingsSummary = {
  notifications: { enabled: 5, total: 5 },
};

export const MOCK_AVAILABILITY: AvailabilityRange[] = [
  {
    id: 'a1',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    days: {
      mon: [{ start: '08:00', end: '17:00' }],
      tue: [
        { start: '08:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
      wed: [{ start: '09:00', end: '17:00' }],
      thu: [{ start: '08:00', end: '17:00' }],
      fri: [{ start: '08:00', end: '16:00' }],
      sat: [],
      sun: [],
    },
  },
];

export const MOCK_BLOCKED_DAYS: BlockedDay[] = [
  {
    id: 'b1',
    title: 'Staff training',
    startDate: '2026-09-05',
    endDate: '2026-09-05',
    hours: { start: '09:00', end: '13:00' },
    notifyOffice: true,
  },
  {
    id: 'b2',
    title: 'Vacation',
    startDate: '2026-09-09',
    endDate: '2026-09-12',
    notifyOffice: true,
  },
  {
    id: 'b3',
    title: 'Doctor’s appointment',
    startDate: '2026-09-16',
    endDate: '2026-09-16',
    hours: { start: '13:00', end: '14:00' },
    notifyOffice: false,
  },
];
