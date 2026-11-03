import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import { NoteStatusPill } from '@/domain/notes/components/NoteStatusPill';
import type { NoteStatusStyle } from '@/domain/notes/noteStyles';
import { useTheme } from '@/hooks/useTheme';

export type NoteCardProps = {
  icon: IconName;
  iconColor: ThemeColor;
  iconBackground: ThemeColor;
  title: string;
  lines: readonly string[];
  status: NoteStatusStyle;
  progress?: number;
  onPress?: () => void;
};

export function NoteCard({
  icon,
  iconColor,
  iconBackground,
  title,
  lines,
  status,
  progress,
  onPress,
}: NoteCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, ...lines, status.label].join(', ')}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background },
        pressed && styles.pressed,
      ]}>
      <IconCircle icon={icon} color={iconColor} backgroundColor={iconBackground} size={36} />
      <View style={styles.body}>
        <ThemedText numberOfLines={1} style={styles.title}>
          {title}
        </ThemedText>
        {lines.map((line) => (
          <ThemedText key={line} numberOfLines={1} themeColor="textSecondary" style={styles.line}>
            {line}
          </ThemedText>
        ))}
        {progress === undefined ? null : (
          <ProgressBar progress={progress} style={styles.progress} />
        )}
      </View>
      <NoteStatusPill status={status} style={styles.status} />
      <Icon
        name={{ ios: 'chevron.right', android: 'chevron_right' }}
        size={18}
        color={theme.accent}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
    paddingVertical: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
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
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
  },
  line: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  progress: {
    marginTop: Spacing.two,
  },
  status: {
    alignSelf: 'center',
  },
});
