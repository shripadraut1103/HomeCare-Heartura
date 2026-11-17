import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const BOX_HEIGHT = 56;

type CodeInputProps = {
  value: string;
  length: number;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: boolean;
  disabled?: boolean;
};

export function CodeInput({ value, length, onChange, onSubmit, error, disabled }: CodeInputProps) {
  const theme = useTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(true);
  const active = Math.min(value.length, length - 1);

  return (
    <Pressable accessible={false} onPress={() => inputRef.current?.focus()} style={styles.row}>
      {Array.from({ length }, (_, index) => {
        const isActive = focused && !disabled && index === active;
        return (
          <View
            key={index}
            style={[
              styles.box,
              {
                backgroundColor: theme.background,
                borderColor: error ? theme.error : isActive ? theme.primary : theme.border,
              },
              isActive && styles.activeBox,
            ]}>
            <ThemedText style={styles.digit}>{value[index] ?? ''}</ThemedText>
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        accessibilityLabel={`${length}-digit code`}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        autoFocus
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        caretHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  box: {
    flex: 1,
    height: BOX_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  activeBox: {
    borderWidth: 2,
  },
  digit: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 600,
    fontVariant: ['tabular-nums'],
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
    color: 'transparent',
  },
});
