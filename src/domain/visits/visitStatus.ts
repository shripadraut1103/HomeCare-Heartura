import type { ThemeColor } from '@/constants/Theme';
import type { VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';

type StatusStyle = {
  label: string;
  color: ThemeColor;
  background: ThemeColor;
  dot: ThemeColor;
};

export const VISIT_STATUS: Record<VisitStatus, StatusStyle> = {
  scheduled: { label: 'Scheduled', color: 'primary', background: 'primaryMuted', dot: 'primary' },
  inProgress: {
    label: 'In progress',
    color: 'toneBlueFg',
    background: 'toneBlueBg',
    dot: 'toneBlueFg',
  },
  completed: { label: 'Completed', color: 'success', background: 'successMuted', dot: 'success' },
  cancelled: { label: 'Cancelled', color: 'toneRedFg', background: 'toneRedBg', dot: 'error' },
  noShow: { label: 'No-show', color: 'toneAmberFg', background: 'toneAmberBg', dot: 'warning' },
  rescheduled: {
    label: 'Rescheduled',
    color: 'toneAmberFg',
    background: 'toneAmberBg',
    dot: 'toneAmberFg',
  },
};

/** Statuses a provider can set by hand from "Change status". */
export const EDITABLE_VISIT_STATUSES: readonly VisitStatus[] = [
  'scheduled',
  'cancelled',
  'noShow',
  'rescheduled',
];
