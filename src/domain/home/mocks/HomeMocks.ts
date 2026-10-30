import { MOCK_USER } from '@/domain/auth/mocks/AuthMocks';
import type { HomeSummary, ScheduledVisit } from '@/domain/home/interfaces/HomeInterfaces';

/**
 * TEMPORARY: Home dashboard data until the API exists.
 * Delete this file once `useHomeSummary` reads from the service.
 */

const todayAt = (hours: number, minutes = 0) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const visit = (
  id: string,
  [hours, minutes]: [number, number],
  durationMinutes: number,
  patientName: string,
  details: string
): ScheduledVisit => ({
  id,
  startsAt: todayAt(hours, minutes),
  durationMinutes,
  patientName,
  patientTag: 'HR',
  details,
  status: 'scheduled',
});

export const createMockHomeSummary = (): HomeSummary => ({
  providerName: MOCK_USER.name,
  unreadNotifications: 18,
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
  todaysVisits: [
    visit('v1', [8, 0], 60, 'Aisha Vance', 'PT · Evaluation · Private pay'),
    visit('v2', [9, 0], 45, 'Luca Bertrand', 'PT · Daily visit · Group home'),
    visit('v3', [10, 0], 45, 'Gina Mancuso', 'PT · Daily visit · Private pay'),
    visit('v4', [11, 0], 60, 'Theo Lindgren', 'PT · Evaluation · Private pay'),
    visit('v5', [13, 30], 60, 'Eli Nakamura', 'PT · Daily visit · Private pay'),
    visit('v6', [15, 0], 45, 'Maya Okafor', 'PT · Daily visit · Private pay'),
    visit('v7', [16, 0], 120, 'Marcus Lee', 'DSP · Daily visit · Community'),
  ],
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
