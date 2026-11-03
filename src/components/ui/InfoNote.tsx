import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const INFO: IconName = { ios: 'info.circle', android: 'info' };

type InfoNoteProps = {
  text: ReactNode;
  icon?: IconName;
  collapsible?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function InfoNote({ text, icon = INFO, collapsible = true, style }: InfoNoteProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(!collapsible);

  return (
    <Pressable
      disabled={!collapsible}
      accessibilityRole={collapsible ? 'button' : undefined}
      accessibilityState={collapsible ? { expanded } : undefined}
      accessibilityHint={
        collapsible ? (expanded ? 'Shows less' : 'Shows the full text') : undefined
      }
      onPress={() => setExpanded((current) => !current)}
      style={[styles.row, style]}>
      <Icon name={icon} size={16} color={theme.textSecondary} />
      <ThemedText
        themeColor="textSecondary"
        numberOfLines={expanded ? undefined : 1}
        ellipsizeMode="tail"
        style={styles.text}>
        {text}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
});
