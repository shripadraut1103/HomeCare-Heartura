import type { IconName } from '@/components/ui/Icon';
import type { ThemeColor } from '@/constants/Theme';
import type { ActivityKind, VisitVerification } from '@/domain/logs/interfaces/LogInterfaces';

export type LogPillStyle = { label: string; color: ThemeColor; background: ThemeColor };

export const VERIFICATION_PILL: Record<VisitVerification, LogPillStyle> = {
  gps: { label: 'GPS', color: 'success', background: 'successMuted' },
  manual: { label: 'Manual', color: 'toneAmberFg', background: 'toneAmberBg' },
  exempt: { label: 'Exempt', color: 'textSecondary', background: 'backgroundElement' },
};

export const NOT_SIGNED_PILL: LogPillStyle = {
  label: 'Not signed',
  color: 'toneAmberFg',
  background: 'toneAmberBg',
};

const CLOCK: { icon: IconName; color: ThemeColor } = {
  icon: { ios: 'clock', android: 'schedule' },
  color: 'textSecondary',
};

export const ACTIVITY_ICON: Record<ActivityKind, { icon: IconName; color: ThemeColor }> = {
  clockIn: CLOCK,
  clockOut: CLOCK,
  signedNote: { icon: { ios: 'doc', android: 'description' }, color: 'toneBlueFg' },
};
