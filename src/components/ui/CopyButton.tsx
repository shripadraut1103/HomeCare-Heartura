import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useTheme } from '@/hooks/useTheme';

type CopyButtonProps = {
  text: string;
  label: string;
};

export function CopyButton({ text, label }: CopyButtonProps) {
  const theme = useTheme();
  const { copied, copy } = useCopyToClipboard();
  const color = copied ? 'success' : 'accent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copied ? 'Copied' : `Copy ${label}`}
      hitSlop={8}
      onPress={() => copy(text)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon
        name={
          copied
            ? { ios: 'checkmark', android: 'check' }
            : { ios: 'doc.on.doc', android: 'content_copy' }
        }
        size={18}
        color={theme[color]}
      />
      <ThemedText themeColor={color} style={styles.label}>
        {copied ? 'Copied' : 'Copy'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
  },
});
