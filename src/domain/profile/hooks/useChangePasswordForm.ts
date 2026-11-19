import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { newPasswordError } from '@/domain/auth/passwordErrors';
import { sessionExpired } from '@/domain/auth/store/AuthReducer';
import AuthService from '@/domain/auth/store/services/AuthServices';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/domain/profile/schemas/changePasswordSchema';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export function useChangePasswordForm(onChanged: () => void) {
  const dispatch = useAppDispatch();
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const newPassword = useWatch({ control: form.control, name: 'newPassword' });

  const submit = () => {
    void form.handleSubmit(
      async ({ currentPassword, newPassword: password }) => {
        const result = await AuthService.changePassword({ currentPassword, newPassword: password });
        if (!('error' in result)) {
          haptics.success();
          onChanged();
          dispatch(sessionExpired());
          dispatch(
            setToastMessage({
              message: 'Password changed. Sign in again with your new password.',
            })
          );
          return;
        }
        haptics.error();
        const policyError = newPasswordError(result);
        if (result.code === 'CURRENT_PASSWORD_INVALID') {
          form.setError('currentPassword', { message: result.error }, { shouldFocus: true });
        } else if (policyError) {
          form.setError('newPassword', { message: policyError }, { shouldFocus: true });
        } else {
          dispatch(setToastMessage({ message: result.error, type: 'error' }));
        }
      },
      () => haptics.error()
    )();
  };

  return {
    control: form.control,
    newPassword,
    focusField: (name: keyof ChangePasswordFormValues) => form.setFocus(name),
    submit,
    isSubmitting: form.formState.isSubmitting,
  };
}
