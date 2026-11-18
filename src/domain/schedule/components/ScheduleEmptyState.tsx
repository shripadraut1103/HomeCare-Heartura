import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { IconCircle } from '@/components/ui/IconCircle';
import { Spacing } from '@/constants/Theme';

type ScheduleEmptyStateProps = {
  filtered: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function ScheduleEmptyState({ filtered, loading, error, onRetry }: ScheduleEmptyStateProps) {
  const title = error
    ? 'Couldn’t load visits'
    : loading
      ? 'Loading visits…'
      : filtered
        ? 'No matching visits'
        : 'Nothing scheduled';
  const message = error
    ? error
    : loading
      ? 'Fetching the schedule for these weeks.'
      : filtered
        ? 'Try another patient or status in the filter.'
        : 'Tap + to schedule an appointment.';

  return (
    <Animated.View accessible entering={FadeIn.duration(180)} style={styles.container}>
      <IconCircle
        icon={
          error
            ? { ios: 'wifi.exclamationmark', android: 'wifi_off' }
            : filtered
              ? { ios: 'line.3.horizontal.decrease', android: 'filter_list' }
              : { ios: 'calendar', android: 'calendar_month' }
        }
        color={error ? 'error' : 'textSecondary'}
        backgroundColor="surfaceMuted"
        size={64}
      />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {error && onRetry ? (
        <Button title="Try again" variant="secondary" style={styles.retry} onPress={onRetry} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  title: {
    marginTop: Spacing.four,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 600,
    textAlign: 'center',
  },
  message: {
    marginTop: Spacing.four,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
    textAlign: 'center',
  },
  retry: {
    marginTop: Spacing.four,
    minWidth: 160,
  },
});
