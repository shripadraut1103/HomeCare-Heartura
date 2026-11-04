import {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useState, type Ref } from 'react';
import type { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { Button } from '@/components/ui/Button';
import { FormTextField } from '@/components/ui/FormTextField';
import { PasswordVisibilityToggle } from '@/components/ui/PasswordVisibilityToggle';
import type { TextFieldProps } from '@/components/ui/TextField';
import { Spacing } from '@/constants/Theme';
import { PasswordRules } from '@/domain/profile/components/PasswordRules';
import { useChangePasswordForm } from '@/domain/profile/hooks/useChangePasswordForm';
import type { ChangePasswordFormValues } from '@/domain/profile/schemas/changePasswordSchema';
import { useTheme } from '@/hooks/useTheme';

// Its ref type also allows `undefined`; the instance is still a regular TextInput.
const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

export function ChangePasswordSheet({ ref }: { ref: Ref<BottomSheetModal> }) {
  return (
    <AppBottomSheet
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {/* Mounted fresh on every `present`, so the fields always start empty. */}
      {() => <ChangePasswordContent />}
    </AppBottomSheet>
  );
}

function ChangePasswordContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const close = () => dismiss();
  const { control, newPassword, focusField, submit, isSubmitting } = useChangePasswordForm(close);

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Change password" onClose={close} />

      <View style={styles.body}>
        <PasswordField
          control={control}
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="next"
          onSubmitEditing={() => focusField('newPassword')}
        />
        <View style={styles.newPassword}>
          <PasswordField
            control={control}
            name="newPassword"
            label="New password"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => focusField('confirmPassword')}
          />
          <PasswordRules password={newPassword} />
        </View>
        <PasswordField
          control={control}
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button title="Cancel" variant="secondary" style={styles.flex} onPress={close} />
        <Button
          title="Change password"
          loading={isSubmitting}
          style={styles.flex}
          onPress={submit}
        />
      </View>
    </BottomSheetView>
  );
}

type PasswordFieldProps = Omit<TextFieldProps, 'value' | 'onChangeText' | 'error' | 'ref'> & {
  control: Control<ChangePasswordFormValues>;
  name: keyof ChangePasswordFormValues;
};

/** Password input with a show / hide toggle. */
function PasswordField({ control, name, label, ...fieldProps }: PasswordFieldProps) {
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
  body: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  newPassword: {
    gap: Spacing.three - Spacing.one,
  },
  label: {
    fontWeight: 500,
  },
  input: {
    minHeight: 48,
    paddingRight: Spacing.six,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});
