import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/InfoNote';
import { Spacing } from '@/constants/Theme';
import { AvailabilityRangeCard } from '@/domain/profile/components/AvailabilityRangeCard';
import { SettingsScreenLayout } from '@/domain/profile/components/SettingsScreenLayout';
import { useAvailabilityRanges } from '@/domain/profile/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';

export default function AvailabilityScreen() {
  const theme = useTheme();
  const ranges = useAvailabilityRanges();

  return (
    <SettingsScreenLayout title="Availability">
      <View style={styles.top}>
        <Button
          title="Add availability"
          size="large"
          onPress={() => router.push('/edit-availability')}
          icon={<Icon name={{ ios: 'plus', android: 'add' }} size={20} color={theme.onPrimary} />}
        />
        <InfoNote text="Preferred hours only; visits can still be booked outside these hours when needed." />
      </View>
      {ranges.length === 0 ? (
        <EmptyState message="No availability yet. Add the hours you prefer to work." />
      ) : (
        ranges.map((range) => (
          <Animated.View
            key={range.id}
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(180)}
            layout={LinearTransition.duration(220)}>
            <AvailabilityRangeCard
              range={range}
              onEdit={({ id }) => router.push({ pathname: '/edit-availability', params: { id } })}
            />
          </Animated.View>
        ))
      )}
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  top: {
    gap: Spacing.two,
  },
});
