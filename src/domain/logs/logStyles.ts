import type { IconName } from '@/components/ui/Icon';
import type { ThemeColor } from '@/constants/Theme';
import type {
  ActivityKind,
  EvvStatus,
  NoteStatus,
  VisitLogEntry,
} from '@/domain/logs/interfaces/LogInterfaces';

export type LogPillStyle = { label: string; color: ThemeColor; background: ThemeColor };

type PillColors = Omit<LogPillStyle, 'label'>;

const NEUTRAL: PillColors = { color: 'textSecondary', background: 'backgroundElement' };
const ATTENTION: PillColors = { color: 'toneAmberFg', background: 'toneAmberBg' };

const EVV_COLORS: Record<EvvStatus, PillColors> = {
  gps: { color: 'success', background: 'successMuted' },
  manual: ATTENTION,
  exempt: NEUTRAL,
  not_recorded: NEUTRAL,
};

const NOTE_COLORS: Record<Exclude<NoteStatus, 'signed'>, PillColors> = {
  draft: ATTENTION,
  missing: { color: 'toneRedFg', background: 'toneRedBg' },
};

export function visitPills(entry: VisitLogEntry): LogPillStyle[] {
  const evv = { label: entry.evvLabel, ...(EVV_COLORS[entry.evvStatus] ?? NEUTRAL) };
  if (entry.noteStatus === 'signed') return [evv];
  return [evv, { label: entry.noteLabel, ...(NOTE_COLORS[entry.noteStatus] ?? ATTENTION) }];
}

type ActivityIcon = { icon: IconName; color: ThemeColor };

const FALLBACK_ICON: ActivityIcon = {
  icon: { ios: 'clock', android: 'schedule' },
  color: 'textSecondary',
};

const ACTIVITY_ICON: Record<ActivityKind, ActivityIcon> = {
  note: { icon: { ios: 'doc', android: 'description' }, color: 'toneBlueFg' },
  request: { icon: { ios: 'person.badge.plus', android: 'person_add' }, color: 'tonePurpleFg' },
  visit: { icon: { ios: 'calendar', android: 'event' }, color: 'toneRoseFg' },
  profile: { icon: { ios: 'person', android: 'person' }, color: 'toneAmberFg' },
  evv: FALLBACK_ICON,
};

export const activityIcon = (kind: ActivityKind) => ACTIVITY_ICON[kind] ?? FALLBACK_ICON;
