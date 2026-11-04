import { useRef, useState, type ComponentRef } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const MENU_GAP = Spacing.two;
const OPTION_HEIGHT = (Spacing.three - Spacing.one) * 2 + 22;
const MENU_PADDING = Spacing.one * 2;

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type SelectProps<T extends string> = {
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  required?: boolean;
  error?: string;
  options: readonly SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
};

type Anchor = { x: number; y: number; width: number; height: number };

export function Select<T extends string>({
  label,
  labelStyle,
  required = false,
  error,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: SelectProps<T>) {
  const theme = useTheme();
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const open = anchor !== null;
  const selected = options.find((option) => option.value === value);

  const openMenu = () => {
    haptics.selection();
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({ x, y, width, height })
    );
  };
  const closeMenu = () => setAnchor(null);

  const choose = (next: T) => {
    closeMenu();
    if (next === value) return;
    haptics.selection();
    onChange(next);
  };

  return (
    <View style={styles.field}>
      {label ? (
        <ThemedText themeColor="textSecondary" style={[styles.label, labelStyle]}>
          {label}
          {required ? (
            <ThemedText themeColor="error" style={labelStyle}>
              {'  *'}
            </ThemedText>
          ) : null}
        </ThemedText>
      ) : null}
      <Pressable
        ref={triggerRef}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label }}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={openMenu}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.background,
            borderColor: open ? theme.primary : error ? theme.error : theme.border,
          },
          open && { outlineColor: theme.primaryMuted, outlineWidth: 3, outlineStyle: 'solid' },
        ]}>
        <ThemedText
          numberOfLines={1}
          themeColor={selected ? 'text' : 'textSecondary'}
          style={styles.value}>
          {selected ? selected.label : (placeholder ?? ' ')}
          {selected?.hint ? ` · ${selected.hint}` : ''}
        </ThemedText>
        <Icon
          name={
            open
              ? { ios: 'chevron.up', android: 'keyboard_arrow_up' }
              : { ios: 'chevron.down', android: 'keyboard_arrow_down' }
          }
          size={16}
          color={theme.textSecondary}
        />
      </Pressable>
      {error ? (
        <ThemedText type="small" themeColor="error" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closeMenu}>
        <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={closeMenu} />
        {anchor ? (
          <View
            accessibilityRole="menu"
            style={[
              styles.menu,
              {
                ...(anchor.y +
                  anchor.height +
                  MENU_GAP +
                  options.length * OPTION_HEIGHT +
                  MENU_PADDING >
                windowHeight - insets.bottom
                  ? { bottom: windowHeight - anchor.y + MENU_GAP }
                  : { top: anchor.y + anchor.height + MENU_GAP }),
                left: anchor.x,
                width: anchor.width,
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => choose(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    (isSelected || pressed) && { backgroundColor: theme.surfaceMuted },
                  ]}>
                  <ThemedText
                    themeColor={isSelected ? 'primary' : 'text'}
                    numberOfLines={2}
                    style={styles.optionLabel}>
                    {option.label}
                    {option.hint ? ` · ${option.hint}` : ''}
                  </ThemedText>
                  {isSelected ? (
                    <Icon
                      name={{ ios: 'checkmark', android: 'check' }}
                      size={16}
                      color={theme.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  value: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 500,
  },
  menu: {
    position: 'absolute',
    padding: Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.floating,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.three - Spacing.one,
    borderRadius: Radius.small,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
  },
});
