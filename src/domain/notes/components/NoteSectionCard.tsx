import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import type { NoteSection } from '@/domain/notes/interfaces/NoteInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const ACCENT_WIDTH = 3;
const LAYOUT_TRANSITION = LinearTransition.duration(220);
const BODY_ENTERING = FadeIn.duration(180);

type NoteSectionCardProps = {
  section: NoteSection;
  expanded: boolean;
  onToggle: (sectionId: string) => void;
  children: ReactNode;
};

export function NoteSectionCard({ section, expanded, onToggle, children }: NoteSectionCardProps) {
  const theme = useTheme();

  return (
    <Animated.View
      layout={LAYOUT_TRANSITION}
      style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={section.source ? `${section.title}, ${section.source}` : section.title}
        onPress={() => {
          haptics.selection();
          onToggle(section.id);
        }}
        style={({ pressed }) => [
          styles.header,
          { backgroundColor: theme.surfaceMuted, borderLeftColor: theme[section.accent] },
          expanded && [styles.headerExpanded, { borderBottomColor: theme.border }],
          pressed && styles.pressed,
        ]}>
        <ThemedText style={styles.title}>{section.title}</ThemedText>
        {section.source ? (
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.source}>
            {section.source}
          </ThemedText>
        ) : null}
        <Icon
          name={
            expanded
              ? { ios: 'chevron.down', android: 'keyboard_arrow_down' }
              : { ios: 'chevron.right', android: 'chevron_right' }
          }
          size={18}
          color={theme.textSecondary}
        />
      </Pressable>
      {expanded ? (
        <Animated.View entering={BODY_ENTERING} style={styles.body}>
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 64,
    paddingVertical: Spacing.three,
    paddingLeft: Spacing.three + Spacing.half,
    paddingRight: Spacing.four,
    borderLeftWidth: ACCENT_WIDTH,
  },
  headerExpanded: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  source: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  body: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingVertical: Spacing.three,
  },
});
