import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

/** Header for pushed screens: back chevron, title and an optional subtitle. */
export function ScreenHeader({ title, subtitle, onBack = router.back }: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={onBack}
        style={styles.back}>
        <Icon
          name={{ ios: 'chevron.left', android: 'arrow_back_ios' }}
          size={20}
          color={theme.text}
        />
      </Pressable>
      <View style={styles.titles}>
        <ThemedText accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  back: {
    padding: Spacing.one,
  },
  titles: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
});
