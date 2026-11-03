import { useState, type ComponentRef, type ComponentType, type ReactNode, type Ref } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type InputRef = Ref<ComponentRef<typeof TextInput>>;

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
  labelHint?: string;
  labelStyle?: StyleProp<TextStyle>;
  accessory?: ReactNode;
  ref?: InputRef;
  InputComponent?: ComponentType<TextInputProps & { ref?: InputRef }>;
};

export function TextField({
  label,
  error,
  required = false,
  labelHint,
  labelStyle,
  accessory,
  style,
  onFocus,
  onBlur,
  ref,
  InputComponent = TextInput,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? theme.error : isFocused ? theme.primary : theme.border;

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={[styles.label, labelStyle]}>
        {label}
        {labelHint ? (
          <ThemedText themeColor="textSecondary" style={[labelStyle, styles.labelHint]}>
            {`  ${labelHint}`}
          </ThemedText>
        ) : null}
        {required ? (
          <ThemedText themeColor="error" style={labelStyle}>
            {'  *'}
          </ThemedText>
        ) : null}
      </ThemedText>
      <View>
        <InputComponent
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            { borderColor, color: theme.text, backgroundColor: theme.background },
            style,
          ]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
      </View>
      {error ? (
        <ThemedText type="small" themeColor="error" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.three - Spacing.one,
    fontSize: 16,
  },
  labelHint: {
    fontWeight: 400,
  },
  accessory: {
    position: 'absolute',
    right: Spacing.two,
    bottom: Spacing.two,
  },
});
