import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FormTextField } from '@/components/ui/FormTextField';
import { Spacing } from '@/constants/Theme';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useEditProfileForm } from '@/domain/profile/hooks/useEditProfileForm';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { useProfilePhoto } from '@/domain/profile/hooks/useProfilePhoto';
import { useTheme } from '@/hooks/useTheme';

const AVATAR_SIZE = 88;

export default function EditProfileScreen() {
  const theme = useTheme();
  const profile = useProfile();
  const { control, focusField, submit, saving, canSave } = useEditProfileForm();
  const photo = useProfilePhoto(Boolean(profile.photoUrl));

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
          <Button
            title="Save"
            disabled={!canSave}
            loading={saving}
            style={styles.flex}
            onPress={submit}
          />
        </>
      }>
      <View style={styles.photo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          disabled={photo.busy}
          onPress={photo.choose}>
          <Avatar
            name={profile.name}
            uri={profile.photoUrl}
            size={AVATAR_SIZE}
            color="toneBlueFg"
            backgroundColor="toneBlueBg"
          />
          {photo.busy ? (
            <View style={[styles.busy, { backgroundColor: theme.backgroundScreen }]}>
              <ActivityIndicator />
            </View>
          ) : null}
        </Pressable>
        <Button
          title={profile.photoUrl ? 'Change photo' : 'Add photo'}
          variant="link"
          disabled={photo.busy}
          onPress={photo.choose}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormTextField
            control={control}
            name="firstName"
            label="First name"
            labelStyle={styles.label}
            style={styles.input}
            textContentType="givenName"
            autoComplete="name-given"
            returnKeyType="next"
            onSubmitEditing={() => focusField('lastName')}
          />
        </View>
        <View style={styles.flex}>
          <FormTextField
            control={control}
            name="lastName"
            label="Last name"
            labelStyle={styles.label}
            style={styles.input}
            textContentType="familyName"
            autoComplete="name-family"
            returnKeyType="next"
            onSubmitEditing={() => focusField('phone')}
          />
        </View>
      </View>
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
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <View style={styles.readOnly}>
        <ThemedText themeColor="textSecondary" style={styles.label}>
          Home address
        </ThemedText>
        <ThemedText>{profile.contact.homeAddress || '—'}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.note}>
          Managed by your office. Ask them to update it.
        </ThemedText>
      </View>
    </ModalFormLayout>
  );
}

const styles = StyleSheet.create({
  photo: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  busy: {
    ...StyleSheet.absoluteFill,
    borderRadius: AVATAR_SIZE / 2,
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  label: {
    fontWeight: 500,
  },
  input: {
    minHeight: 48,
  },
  readOnly: {
    gap: Spacing.one,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
  },
  flex: {
    flex: 1,
  },
});
