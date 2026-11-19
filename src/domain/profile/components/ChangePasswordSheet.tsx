import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/Theme';
import { PasswordRules } from '@/domain/profile/components/PasswordRules';
import { SheetPasswordField } from '@/domain/profile/components/PasswordField';
import { useChangePasswordForm } from '@/domain/profile/hooks/useChangePasswordForm';
import { useTheme } from '@/hooks/useTheme';

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
        <SheetPasswordField
          control={control}
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="next"
          onSubmitEditing={() => focusField('newPassword')}
        />
        <View style={styles.newPassword}>
          <SheetPasswordField
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
        <SheetPasswordField
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

const styles = StyleSheet.create({
  body: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  newPassword: {
    gap: Spacing.three - Spacing.one,
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
