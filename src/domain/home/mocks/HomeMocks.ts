import { MOCK_USER } from '@/domain/auth/mocks/AuthMocks';
import type { HomeSummary } from '@/domain/home/interfaces/HomeInterfaces';

/**
 * TEMPORARY: Home dashboard data until the API exists.
 * Delete this file once `useHomeSummary` reads from the service.
 */

export const createMockHomeSummary = (): HomeSummary => ({
  providerName: MOCK_USER.name,
  stats: [
    {
      id: 'notes',
      count: 6,
      label: 'Notes pending',
      tone: 'blue',
      icon: { ios: 'doc', android: 'description' },
    },
    {
      id: 'progress',
      count: 3,
      label: 'Progress notes due',
      tone: 'amber',
      icon: { ios: 'waveform.path.ecg', android: 'monitor_heart' },
    },
    {
      id: 'cases',
      count: 2,
      label: 'New cases',
      tone: 'red',
      icon: { ios: 'person.2', android: 'group' },
    },
    {
      id: 'requests',
      count: 3,
      label: 'Requests',
      tone: 'rose',
      icon: { ios: 'bell', android: 'notifications' },
    },
  ],
  unscheduledPatients: 2,
  newCases: [
    {
      id: 'c1',
      patientName: 'Priya Shah',
      discipline: 'PT',
      summary: 'New referral · evaluation needed',
    },
    {
      id: 'c2',
      patientName: 'Omar Haddad',
      discipline: 'PT',
      summary: 'Reassigned from Daniel Okafor',
      note: 'No action in 7 days · the office was emailed 09/03/2026',
    },
  ],
});
