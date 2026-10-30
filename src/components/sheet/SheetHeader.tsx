import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type SheetHeaderProps = {
  title: string;
  titleSuffix?: string;
  onClose: () => void;
};

export function SheetHeader({ title, titleSuffix, onClose }: SheetHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <ThemedText accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {title}
        {titleSuffix ? (
          <ThemedText themeColor="textSecondary" style={styles.suffix}>
            {' '}
            {titleSuffix}
          </ThemedText>
        ) : null}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        onPress={onClose}>
        <Icon name={{ ios: 'xmark', android: 'close' }} size={22} color={theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  suffix: {
    fontWeight: 400,
  },
});
