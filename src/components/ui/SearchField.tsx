import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
};

export function SearchField({ value, onChangeText, placeholder, style }: SearchFieldProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.search,
        { backgroundColor: theme.background, borderColor: theme.border },
        style,
      ]}>
      <Icon
        name={{ ios: 'magnifyingglass', android: 'search' }}
        size={20}
        color={theme.textSecondary}
      />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, { color: theme.text }]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => onChangeText('')}>
          <Icon
            name={{ ios: 'xmark.circle.fill', android: 'cancel' }}
            size={18}
            color={theme.textSecondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    ...Shadows.card,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: Spacing.two,
  },
});
