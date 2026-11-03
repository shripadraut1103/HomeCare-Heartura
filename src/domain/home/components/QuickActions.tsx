import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type QuickActionsProps = {
  onCreateVisitPress?: () => void;
  onSchedulePress?: () => void;
};

export function QuickActions({ onCreateVisitPress, onSchedulePress }: QuickActionsProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Button
        title="Create Visit"
        size="large"
        style={styles.button}
        onPress={onCreateVisitPress}
        icon={<Icon name={{ ios: 'plus', android: 'add' }} size={20} color={theme.onPrimary} />}
      />
      <Button
        title="Schedule"
        variant="secondary"
        size="large"
        style={styles.button}
        onPress={onSchedulePress}
        icon={
          <Icon
            name={{ ios: 'calendar', android: 'calendar_month' }}
            size={20}
            color={theme.text}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
  },
  button: {
    flex: 1,
  },
});
