import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useProfile } from '@/domain/profile/hooks/useProfile';
import {
  editProfileSchema,
  type EditProfileFormValues,
} from '@/domain/profile/schemas/editProfileSchema';
import { updateContact } from '@/domain/profile/store/ProfileReducer';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export function useEditProfileForm() {
  const dispatch = useAppDispatch();
  const { contact } = useProfile();

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: contact,
  });
  const { isDirty } = form.formState;
  const { leave } = useUnsavedChangesGuard(
    isDirty,
    'Your edits to your contact details won’t be saved.'
  );

  const submit = () => {
    void form.handleSubmit(
      (values) => {
        dispatch(updateContact(values));
        dispatch(setToastMessage({ message: 'Contact details updated' }));
        haptics.success();
        leave();
      },
      () => haptics.error()
    )();
  };

  return {
    control: form.control,
    focusField: (name: keyof EditProfileFormValues) => form.setFocus(name),
    submit,
    canSave: isDirty,
  };
}
