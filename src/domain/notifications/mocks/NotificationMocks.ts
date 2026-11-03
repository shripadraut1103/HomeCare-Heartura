import type { AppNotification } from '@/domain/notifications/interfaces/NotificationInterfaces';

/**
 * TEMPORARY: notifications until the API exists.
 * Delete this file once `useNotifications` reads from the service.
 */

const missedClockIn = (
  id: string,
  time: string,
  patient: string,
  patientId: string,
  visitId: string
): AppNotification => ({
  id,
  category: 'evvSchedule',
  kind: 'missedClockIn',
  title: `Your ${time} visit started, you haven’t clocked in`,
  message: `${patient} · clock in, or enter the time with a reason if you forgot`,
  patientId,
  visitId,
});

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  // Plans & progress
  {
    id: 'n1',
    category: 'plansProgress',
    kind: 'carePlanExpiring',
    title: 'Care plan for Maya Okafor expires on 09/15/2026',
    message: 'In 12 days · plan a discharge or next steps',
    patientId: 'p-maya-okafor',
    visitId: 'v6',
  },
  {
    id: 'n2',
    category: 'plansProgress',
    kind: 'carePlanExpiring',
    title: 'Care plan for Hannah Kowalski expires on 09/16/2026',
    message: 'In 13 days · plan a discharge or next steps · treating team review requested',
    patientId: 'p-hannah-kowalski',
    visitId: 'v8',
  },
  {
    id: 'n3',
    category: 'plansProgress',
    kind: 'progressNoteDue',
    title: 'Progress note due · Eli Nakamura',
    message: 'Visit 10 of 10 · created as a draft, write it now',
    patientId: 'p-eli-nakamura',
    visitId: 'v5',
  },
  {
    id: 'n4',
    category: 'plansProgress',
    kind: 'progressNoteDue',
    title: 'Progress note due · Maya Okafor',
    message: 'Visit 9 of 10 · due at the next visit · Monday, September 7',
    patientId: 'p-maya-okafor',
  },
  {
    id: 'n5',
    category: 'plansProgress',
    kind: 'progressNoteDue',
    title: 'Progress note due · Daniel Osei',
    message: 'Visit 9 of 10 · due at the next visit · Tuesday, September 8',
    patientId: 'p-daniel-osei',
  },

  // From office
  {
    id: 'n6',
    category: 'office',
    kind: 'officeMessage',
    title: 'Office · Gina Mancuso',
    message: 'Guardian changed: call Maria Lopez before visits from now on',
    patientId: 'p-gina-mancuso',
  },
  {
    id: 'n7',
    category: 'office',
    kind: 'officeMessage',
    title: 'Office · Theo Lindgren',
    message: 'First visit today. Karin will meet you at the side entrance',
    patientId: 'p-theo-lindgren',
  },
  {
    id: 'n8',
    category: 'office',
    kind: 'coverageRequest',
    title: 'Coverage request',
    message: 'PT coverage needed for a new patient in Paradise Valley this week',
  },
  {
    id: 'n9',
    category: 'office',
    kind: 'allotmentChanged',
    title: 'Weekly allotment changed',
    message: 'Noah Brennan: 8 units a week from 09/06 (new authorization)',
    patientId: 'p-noah-brennan',
  },
  {
    id: 'n10',
    category: 'office',
    kind: 'authorizationEnding',
    title: 'Authorization ending',
    message: 'Sofia Delgado’s PA ends 09/30/2026. The supervisor will request a renewal.',
    patientId: 'p-sofia-delgado',
  },

  // EVV & schedule
  missedClockIn('n11', '3:00 PM', 'Maya Okafor', 'p-maya-okafor', 'v6'),
  missedClockIn('n12', '1:30 PM', 'Eli Nakamura', 'p-eli-nakamura', 'v5'),
  missedClockIn('n13', '11:00 AM', 'Theo Lindgren', 'p-theo-lindgren', 'v4'),
  missedClockIn('n14', '10:00 AM', 'Gina Mancuso', 'p-gina-mancuso', 'v3'),
  missedClockIn('n15', '8:00 AM', 'Aisha Vance', 'p-aisha-vance', 'v1'),
  {
    id: 'n16',
    category: 'evvSchedule',
    kind: 'scheduleChange',
    title: 'Schedule change',
    message: 'Maya Okafor moved to 3:00 PM today (office, 08:12 AM)',
    patientId: 'p-maya-okafor',
    visitId: 'v6',
  },
  {
    id: 'n17',
    category: 'evvSchedule',
    kind: 'missedClockOut',
    title: 'Missed clock-out',
    message: 'Eli Nakamura, 09/01: no clock-out recorded. Add the end time to close the visit.',
    patientId: 'p-eli-nakamura',
  },
  {
    id: 'n18',
    category: 'evvSchedule',
    kind: 'signaturePending',
    title: 'Signature pending',
    message: 'Luca Bertrand, 09/01: the house manager hasn’t signed the visit yet.',
    patientId: 'p-luca-bertrand',
  },
];
