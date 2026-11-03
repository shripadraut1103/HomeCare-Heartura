import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Spacing } from '@/constants/Theme';
import { AppSwitch } from '@/domain/profile/components/AppSwitch';
import { useTheme } from '@/hooks/useTheme';

type ToggleRowProps = {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  divider?: boolean;
  disabled?: boolean;
};

export function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
  divider = false,
  disabled = false,
}: ToggleRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, divider && [styles.divider, { borderBottomColor: theme.border }]]}>
      <View style={styles.body}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <AppSwitch
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
});
