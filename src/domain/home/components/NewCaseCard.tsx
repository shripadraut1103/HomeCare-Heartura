import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import type { NewCase } from '@/domain/home/interfaces/HomeInterfaces';
import { useTheme } from '@/hooks/useTheme';

const NOTE_BAR_WIDTH = 3;

type NewCaseCardProps = {
  newCase: NewCase;
  onPress?: (newCase: NewCase) => void;
};

export function NewCaseCard({ newCase, onPress }: NewCaseCardProps) {
  const theme = useTheme();
  const title = `${newCase.patientName} · ${newCase.discipline}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, newCase.summary, newCase.note, 'Schedule']
        .filter(Boolean)
        .join(', ')}
      onPress={onPress ? () => onPress(newCase) : undefined}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background },
        pressed && styles.pressed,
      ]}>
      <IconCircle
        icon={{ ios: 'person.2', android: 'group' }}
        color="toneRedFg"
        backgroundColor="toneRoseBg"
      />

      <View style={styles.body}>
        <ThemedText numberOfLines={1} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText numberOfLines={1} themeColor="textSecondary" style={styles.summary}>
          {newCase.summary}
        </ThemedText>
        {newCase.note ? (
          <View style={[styles.note, { borderLeftColor: theme.warning }]}>
            <ThemedText themeColor="textSecondary" style={styles.summary}>
              {newCase.note}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <Pill
        label="Schedule"
        color="primary"
        backgroundColor="primaryMuted"
        dot
        style={styles.pill}
      />
      <Icon
        name={{ ios: 'chevron.right', android: 'chevron_right' }}
        size={18}
        color={theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
    padding: Spacing.three,
    borderRadius: Radius.large,
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 700,
  },
  summary: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  note: {
    marginTop: Spacing.one,
    paddingLeft: Spacing.two + Spacing.half,
    borderLeftWidth: NOTE_BAR_WIDTH,
  },
  pill: {
    alignSelf: 'center',
  },
});
