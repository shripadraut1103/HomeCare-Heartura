import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/DetailRow';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import type {
  PatientRequest,
  PatientRequestStatus,
} from '@/domain/requests/interfaces/RequestInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { formatNumericDate, formatTime } from '@/utils/dateFormat';

const STATUS: Record<
  PatientRequestStatus,
  { label: string; color: ThemeColor; background: ThemeColor }
> = {
  waiting: { label: 'Waiting for you', color: 'textSecondary', background: 'backgroundElement' },
  accepted: { label: 'Accepted', color: 'success', background: 'successMuted' },
  declined: { label: 'Declined', color: 'toneRedFg', background: 'toneRedBg' },
};

const formatAssignedAt = (value: string) => {
  const date = new Date(value);
  return `${formatNumericDate(date)} ${formatTime(date).toLowerCase()}`;
};

type RequestCardProps = {
  request: PatientRequest;
  onAccept?: (request: PatientRequest) => void;
  onDecline?: (request: PatientRequest) => void;
};

export function RequestCard({ request, onAccept, onDecline }: RequestCardProps) {
  const theme = useTheme();
  const status = STATUS[request.status];
  const { offer, coordinator, assignedBy } = request;

  const rows: readonly [label: string, value: string][] = [
    [
      'For you',
      `${offer.discipline} · ${offer.visitsPerWeek}× a week · ${offer.durationMinutes} min`,
    ],
    ['Address', `${request.address} · ${request.distanceMiles} mi`],
    ['Authorization', request.authorization],
    ['Coordinator', `${coordinator.name} · ${coordinator.organization}`],
    ['Assigned by', `${assignedBy.name} · ${assignedBy.role} · ${formatAssignedAt(assignedBy.at)}`],
    ...(request.declineReason ? [['Reason', request.declineReason] as [string, string]] : []),
    ...(request.note ? [['Note', request.note] as [string, string]] : []),
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surfaceMuted, borderBottomColor: theme.border },
        ]}>
        <Avatar name={request.patientName} />
        <View style={styles.identity}>
          <ThemedText numberOfLines={1} style={styles.name}>
            {request.patientName}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.meta}>
            {[`${request.age} yrs`, ...request.disciplines, request.city].join(' · ')}
          </ThemedText>
        </View>
        <Pill
          label={status.label}
          color={status.color}
          backgroundColor={status.background}
          dot
          style={styles.status}
        />
      </View>

      <View style={styles.details}>
        {rows.map(([label, value], index) => (
          <DetailRow key={label} label={label} isLast={index === rows.length - 1}>
            {value}
          </DetailRow>
        ))}
      </View>

      {request.status === 'waiting' ? (
        <View style={[styles.actions, { borderTopColor: theme.border }]}>
          <Button
            title="Decline"
            variant="secondary"
            style={styles.flex}
            accessibilityHint={`Declines ${request.patientName}`}
            onPress={() => onDecline?.(request)}
          />
          <Button
            title="Accept"
            style={styles.flex}
            accessibilityHint={`Accepts ${request.patientName}`}
            onPress={() => onAccept?.(request)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  identity: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 700,
  },
  meta: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  status: {
    alignSelf: 'center',
  },
  details: {
    paddingHorizontal: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});
