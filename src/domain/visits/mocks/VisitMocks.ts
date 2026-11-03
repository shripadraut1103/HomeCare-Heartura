import { MOCK_USER } from '@/domain/auth/mocks/AuthMocks';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';

/**
 * TEMPORARY: visits until the API exists.
 * Delete this file once the visits slice loads from the service.
 */

/** `daysFromToday` days from now at the given local time, as ISO. */
const at = (hours: number, minutes: number, daysFromToday = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

type VisitSeed = Pick<
  Visit,
  'id' | 'patientId' | 'patientName' | 'startsAt' | 'durationMinutes' | 'summary'
> &
  Partial<Visit>;

/** Fills in the details the mock list doesn't vary. */
const visit = (seed: VisitSeed): Visit => ({
  patientTag: 'HR',
  status: 'scheduled',
  visitType: 'Daily visit',
  discipline: 'Physical therapy',
  providerName: MOCK_USER.name,
  location: 'Private home · 12 · EVV required',
  address: '512 Prospect Ave, Hackensack, NJ 07601',
  travel: { miles: 9.6, driveMinutes: 23 },
  phone: '(201) 555-0311',
  payer: 'NJ Medicaid · PA 26050093',
  units: {
    summary: '3 of 6 this week · 6 remaining incl. makeup',
    detail: `This visit: 3 units (${seed.durationMinutes} min). Used when the note is saved.`,
  },
  documents: 'Evaluation done · care plan done · daily note',
  ...seed,
});

export const MOCK_VISITS: Visit[] = [
  visit({
    id: 'v1',
    patientId: 'p-aisha-vance',
    patientName: 'Aisha Vance',
    startsAt: at(8, 0),
    durationMinutes: 60,
    visitType: 'Evaluation',
    summary: 'PT · Evaluation · Private pay',
  }),
  visit({
    id: 'v2',
    patientId: 'p-luca-bertrand',
    patientName: 'Luca Bertrand',
    startsAt: at(9, 0),
    durationMinutes: 45,
    location: 'Group home · 21 · EVV required',
    summary: 'PT · Daily visit · Group home',
  }),
  visit({
    id: 'v3',
    patientId: 'p-gina-mancuso',
    patientName: 'Gina Mancuso',
    startsAt: at(10, 0),
    durationMinutes: 45,
    guardian: 'Maria Lopez (guardian)',
    summary: 'PT · Daily visit · Private pay',
  }),
  visit({
    id: 'v4',
    patientId: 'p-theo-lindgren',
    patientName: 'Theo Lindgren',
    startsAt: at(11, 0),
    durationMinutes: 60,
    visitType: 'Evaluation',
    notes: 'First visit. Karin will meet you at the side entrance.',
    summary: 'PT · Evaluation · Private pay',
  }),
  visit({
    id: 'v5',
    patientId: 'p-eli-nakamura',
    patientName: 'Eli Nakamura',
    startsAt: at(13, 30),
    durationMinutes: 60,
    summary: 'PT · Daily visit · Private pay',
  }),
  visit({
    id: 'v6',
    patientId: 'p-maya-okafor',
    patientName: 'Maya Okafor',
    startsAt: at(15, 0),
    durationMinutes: 45,
    guardian: 'Chidi Okafor (father)',
    notes: 'Prefers afternoons, quiet room please',
    summary: 'PT · Daily visit · Private pay',
  }),
  visit({
    id: 'v7',
    patientId: 'p-marcus-lee',
    patientName: 'Marcus Lee',
    startsAt: at(16, 0),
    durationMinutes: 120,
    discipline: 'Direct support',
    location: 'Community · EVV required',
    summary: 'DSP · Daily visit · Community',
  }),
  // Not today; reachable from the care-plan notification.
  visit({
    id: 'v8',
    patientId: 'p-hannah-kowalski',
    patientName: 'Hannah Kowalski',
    startsAt: at(9, 30, 1),
    durationMinutes: 45,
    address: '88 Maple St, Teaneck, NJ 07666',
    travel: { miles: 4.2, driveMinutes: 12 },
    phone: '(201) 555-0178',
    summary: 'PT · Daily visit · Medicaid',
  }),
];
