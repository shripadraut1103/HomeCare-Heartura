import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const ACCENT_WIDTH = 4;

type UnscheduledPatientsBannerProps = {
  count: number;
  onSchedulePress?: () => void;
};

export function UnscheduledPatientsBanner({
  count,
  onSchedulePress,
}: UnscheduledPatientsBannerProps) {
  const theme = useTheme();
  if (count <= 0) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
          borderLeftColor: theme.primary,
        },
      ]}>
      <Icon
        name={{ ios: 'exclamationmark.triangle', android: 'warning' }}
        size={22}
        color={theme.text}
      />
      <ThemedText style={styles.message}>
        {count} new {count === 1 ? 'patient' : 'patients'} assigned · not scheduled yet
      </ThemedText>
      <Button
        title="Schedule"
        size="small"
        style={styles.action}
        onPress={onSchedulePress}
        trailingIcon={
          <Icon
            name={{ ios: 'chevron.right', android: 'chevron_right' }}
            size={14}
            color={theme.onPrimary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingVertical: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: ACCENT_WIDTH,
  },
  message: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
  },
  action: {
    minHeight: 40,
    borderRadius: Radius.full,
    gap: Spacing.one,
  },
});
