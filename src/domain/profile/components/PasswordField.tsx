import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import type { Control, FieldPathByValue, FieldValues } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { FormTextField } from '@/components/ui/FormTextField';
import { PasswordVisibilityToggle } from '@/components/ui/PasswordVisibilityToggle';
import type { TextFieldProps } from '@/components/ui/TextField';
import { Spacing } from '@/constants/Theme';

// Its ref type also allows `undefined`; the instance is still a regular TextInput.
const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

type SheetPasswordFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'error' | 'ref'
> & {
  control: Control<T>;
  name: FieldPathByValue<T, string>;
};

export function SheetPasswordField<T extends FieldValues>({
  control,
  name,
  label,
  ...fieldProps
}: SheetPasswordFieldProps<T>) {
  const [visible, setVisible] = useState(false);

  return (
    <FormTextField
      {...fieldProps}
      control={control}
      name={name}
      label={label}
      labelStyle={styles.label}
      InputComponent={SheetTextInput}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.input}
      accessory={
        <PasswordVisibilityToggle
          label={label}
          visible={visible}
          onToggle={() => setVisible((current) => !current)}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 500,
  },
  input: {
    minHeight: 48,
    paddingRight: Spacing.six,
  },
});
