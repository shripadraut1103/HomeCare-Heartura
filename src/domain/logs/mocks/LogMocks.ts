import type { ActivityEntry, VisitLogEntry } from '@/domain/logs/interfaces/LogInterfaces';

/**
 * TEMPORARY: visit and activity logs until the API exists.
 * Delete this file once `useLogs` reads from the logs service.
 */

const visit = (
  id: string,
  patientName: string,
  startsAt: string,
  durationMinutes: number,
  units: number,
  extra: Partial<VisitLogEntry> = {}
): VisitLogEntry => ({
  id,
  patientName,
  visitType: 'Daily visit',
  startsAt,
  durationMinutes,
  units,
  billingCode: 'S8990 HI',
  verification: 'gps',
  signed: true,
  ...extra,
});

export const MOCK_VISIT_LOG: VisitLogEntry[] = [
  visit('v12', 'Jacob Adler', '2026-10-12T09:15:00', 75, 5, {
    verification: 'exempt',
    signed: false,
  }),
  visit('v11', 'Priya Coleman', '2026-10-12T11:45:00', 75, 5, {
    verification: 'manual',
    manualReason: 'reason code',
  }),
  visit('v10', 'Ethan Kaplan', '2026-10-09T08:30:00', 45, 3),
  visit('v9', 'Noah Carter', '2026-10-09T11:30:00', 60, 4),
  visit('v8', 'Daniel Kowalski', '2026-10-08T08:45:00', 60, 4),
  visit('v7', 'Gina Mancuso', '2026-10-07T11:45:00', 75, 5),
  visit('v6', 'Marcus Ferraro', '2026-10-07T09:15:00', 75, 5),
  visit('v5', 'Sofia Morales', '2026-10-06T11:00:00', 45, 3),
  visit('v4', 'Jacob Adler', '2026-10-05T09:00:00', 60, 4),
  visit('v3', 'Priya Coleman', '2026-10-02T11:15:00', 60, 4, {
    visitType: 'Evaluation',
    verification: 'exempt',
  }),
  visit('v2', 'Ethan Kaplan', '2026-10-01T08:45:00', 60, 4),
  visit('v1', 'Noah Carter', '2026-09-30T11:15:00', 60, 4),
];

const toLocalIso = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:00`;
};

/** Activity the visits above would have produced: clock in / out (EVV visits only) and sign-offs. */
const toActivity = (entry: VisitLogEntry): ActivityEntry[] => {
  const start = new Date(entry.startsAt);
  const end = toLocalIso(new Date(start.getTime() + entry.durationMinutes * 60_000));
  const clockDetails =
    entry.verification === 'manual'
      ? `${entry.patientName} · Manual · ${entry.manualReason ?? 'no reason given'}`
      : `${entry.patientName} · GPS verified`;

  return [
    ...(entry.signed
      ? [
          {
            id: `${entry.id}-note`,
            kind: 'signedNote' as const,
            title: entry.visitType === 'Evaluation' ? 'Signed evaluation' : 'Signed daily note',
            details: `${entry.patientName} · ${entry.units} units · ${entry.billingCode}`,
            at: end,
          },
        ]
      : []),
    ...(entry.verification === 'exempt'
      ? []
      : [
          {
            id: `${entry.id}-out`,
            kind: 'clockOut' as const,
            title: 'Clocked out',
            details: clockDetails,
            at: end,
          },
          {
            id: `${entry.id}-in`,
            kind: 'clockIn' as const,
            title: 'Clocked in',
            details: clockDetails,
            at: entry.startsAt,
          },
        ]),
  ];
};

// Newest first; `sort` is stable, so a sign-off stays above the clock-out at the same minute.
export const MOCK_ACTIVITY: ActivityEntry[] = MOCK_VISIT_LOG.flatMap(toActivity).sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
);
