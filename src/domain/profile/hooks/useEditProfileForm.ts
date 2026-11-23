import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useProfile } from '@/domain/profile/hooks/useProfile';
import {
  editProfileSchema,
  type EditProfileFormValues,
} from '@/domain/profile/schemas/editProfileSchema';
import {
  fetchProfileAction,
  updateProfileAction,
} from '@/domain/profile/store/async-actions/ProfileAsyncActions';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const FIELD_NAMES: Record<string, keyof EditProfileFormValues> = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  phone: 'phone',
};

export function useEditProfileForm() {
  const dispatch = useAppDispatch();
  const profile = useProfile();
  const [saving, setSaving] = useState(false);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.contact.phone,
      email: profile.contact.email,
    },
  });
  const { isDirty } = form.formState;
  const { leave } = useUnsavedChangesGuard(
    isDirty && !saving,
    'Your edits to your profile won’t be saved.'
  );

  const save = async (values: EditProfileFormValues) => {
    if (profile.version === undefined) {
      dispatch(setToastMessage({ message: 'Your profile is still loading.', type: 'error' }));
      return;
    }
    setSaving(true);
    const result = await dispatch(
      updateProfileAction({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        version: profile.version,
      })
    );
    setSaving(false);
    const payload = updateProfileAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      haptics.error();
      for (const [field, messages] of Object.entries(payload?.fields ?? {})) {
        const name = FIELD_NAMES[field];
        if (name) form.setError(name, { message: [messages].flat().join(' ') });
      }
      if (payload?.code === 'EDIT_CONFLICT') void dispatch(fetchProfileAction());
      dispatch(
        setToastMessage({
          message: payload?.error || 'Couldn’t save your profile. Try again.',
          type: 'error',
        })
      );
      return;
    }
    form.reset(values);
    haptics.success();
    dispatch(setToastMessage({ message: 'Profile updated' }));
    leave();
  };

  const submit = () => {
    void form.handleSubmit(save, () => haptics.error())();
  };

  return {
    control: form.control,
    focusField: (name: keyof EditProfileFormValues) => form.setFocus(name),
    submit,
    saving,
    canSave: isDirty && !saving,
  };
}
