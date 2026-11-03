import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { PASSWORD_RULES } from '@/domain/profile/schemas/changePasswordSchema';
import { useTheme } from '@/hooks/useTheme';

export function PasswordRules({ password }: { password: string }) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <View
            key={rule.id}
            accessible
            accessibilityLabel={`${rule.label}, ${met ? 'met' : 'not met'}`}
            style={styles.row}>
            <Icon
              name={
                met
                  ? { ios: 'checkmark.circle.fill', android: 'check_circle' }
                  : { ios: 'circle', android: 'radio_button_unchecked' }
              }
              size={16}
              color={met ? theme.success : theme.textSecondary}
            />
            <ThemedText themeColor={met ? 'text' : 'textSecondary'} style={styles.label}>
              {rule.label}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
  },
});
