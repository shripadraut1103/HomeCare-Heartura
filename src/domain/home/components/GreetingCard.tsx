import { StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Gradients, Radius, Shadows, Spacing } from '@/constants/Theme';
import { KpiCard } from '@/domain/home/components/KpiCard';
import type { HomeStat } from '@/domain/home/interfaces/HomeInterfaces';
import { useTheme } from '@/hooks/useTheme';

type GreetingCardProps = {
  greeting: string;
  firstName: string;
  stats: HomeStat[];
};

export function GreetingCard({ greeting, firstName, stats }: GreetingCardProps) {
  const theme = useTheme();
  const gradient = Gradients[useColorScheme() === 'dark' ? 'dark' : 'light'].greeting;

  return (
    <View
      style={[
        styles.card,
        { borderColor: theme.border, backgroundColor: theme.background, backgroundImage: gradient },
      ]}>
      <ThemedText accessibilityRole="header" style={styles.greeting}>
        {greeting}, {firstName}
      </ThemedText>
      <View style={styles.stats}>
        {stats.map((stat) => (
          <KpiCard key={stat.id} stat={stat} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three + Spacing.one,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.raised,
  },
  greeting: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: 700,
    marginBottom: Spacing.three,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
