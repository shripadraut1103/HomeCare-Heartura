import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { FormTextField } from '@/components/ui/FormTextField';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useEditProfileForm } from '@/domain/profile/hooks/useEditProfileForm';

export default function EditProfileScreen() {
  const { control, focusField, submit, canSave } = useEditProfileForm();

  return (
    <ModalFormLayout
      title="Edit profile"
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.flex}
            onPress={() => router.back()}
          />
          <Button title="Save" disabled={!canSave} style={styles.flex} onPress={submit} />
        </>
      }>
      <FormTextField
        control={control}
        name="phone"
        label="Mobile phone"
        labelStyle={styles.label}
        style={styles.input}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        returnKeyType="next"
        onSubmitEditing={() => focusField('email')}
      />
      <FormTextField
        control={control}
        name="email"
        label="Email"
        labelStyle={styles.label}
        style={styles.input}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => focusField('homeAddress')}
      />
      <FormTextField
        control={control}
        name="homeAddress"
        label="Home address"
        labelStyle={styles.label}
        style={styles.input}
        textContentType="fullStreetAddress"
        autoComplete="street-address"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
    </ModalFormLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 500,
  },
  input: {
    minHeight: 48,
  },
  flex: {
    flex: 1,
  },
});
