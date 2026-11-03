import { MOCK_USER } from '@/domain/auth/mocks/AuthMocks';
import type {
  AvailabilityRange,
  BlockedDay,
  ProviderProfile,
  SettingsSummary,
} from '@/domain/profile/interfaces/ProfileInterfaces';

/**
 * TEMPORARY: provider profile and settings until the API exists.
 * Delete this file once the profile slice and `useSettingsSummary` read from the service.
 */

export const MOCK_PROFILE: ProviderProfile = {
  name: MOCK_USER.name,
  status: 'active',
  region: 'Bergen County',
  discipline: { code: 'PT', label: 'Physical therapist' },
  credentials: 'DPT',
  npi: '1427583910',
  license: { state: 'NJ', number: 'PT 40QA01829', expiresOn: '2028-01-31' },
  agencyStartDate: '2022-03-14',
  contact: {
    phone: '(201) 555-0142',
    email: 'helena.ruiz@homecaretherapeutics.com',
    homeAddress: '18 Highwood Ave, Ridgewood, NJ 07450',
  },
  agency: { name: MOCK_USER.organization, officePhone: '(201) 555-0100' },
};

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
