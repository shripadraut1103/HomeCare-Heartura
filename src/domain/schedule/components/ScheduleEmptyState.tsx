import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { IconCircle } from '@/components/ui/IconCircle';
import { Spacing } from '@/constants/Theme';

export function ScheduleEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <Animated.View accessible entering={FadeIn.duration(180)} style={styles.container}>
      <IconCircle
        icon={
          filtered
            ? { ios: 'line.3.horizontal.decrease', android: 'filter_list' }
            : { ios: 'calendar', android: 'calendar_month' }
        }
        color="textSecondary"
        backgroundColor="surfaceMuted"
        size={64}
      />
      <ThemedText style={styles.title}>
        {filtered ? 'No matching visits' : 'Nothing scheduled'}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {filtered
          ? 'Try another patient or status in the filter.'
          : 'Tap + to schedule an appointment.'}
      </ThemedText>
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
});
