import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';

import { setBiometricUnlock } from '@/domain/profile/store/PreferencesReducer';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export function useBiometricSetting() {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector((state) => state.preferences.biometricUnlock);
  const [isChecking, setIsChecking] = useState(false);

  const setEnabled = async (next: boolean) => {
    if (!next) {
      dispatch(setBiometricUnlock(false));
      return;
    }
    setIsChecking(true);
    try {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hasHardware || !isEnrolled) {
        haptics.error();
        dispatch(
          setToastMessage({
            message: 'Set up Face ID or a fingerprint in your device settings first.',
            type: 'warning',
          })
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Turn on Face ID / fingerprint unlock',
      });
      if (result.success) {
        haptics.success();
        dispatch(setBiometricUnlock(true));
      }
    } finally {
      setIsChecking(false);
    }
  };

  return { enabled, isChecking, setEnabled };
}
