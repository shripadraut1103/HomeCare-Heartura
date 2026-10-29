import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';

import { unlockSession } from '@/domain/auth/store/AuthReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export type BiometricUnlockStatus =
  'idle' | 'scanning' | 'success' | 'failed' | 'unavailable' | 'noSession';

const SUCCESS_DELAY_MS = 1000;

const CANCEL_ERRORS = new Set(['user_cancel', 'system_cancel', 'app_cancel', 'user_fallback']);

export function useBiometricUnlock() {
  const dispatch = useAppDispatch();
  const hasSession = useAppSelector((state) => state.auth.refreshToken !== null);
  const [status, setStatus] = useState<Exclude<BiometricUnlockStatus, 'noSession'>>('idle');
  const inFlight = useRef(false);

  const unlock = useCallback(async () => {
    if (inFlight.current || !hasSession) return;

    inFlight.current = true;
    try {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hasHardware || !isEnrolled) {
        setStatus('unavailable');
        return;
      }

      setStatus('scanning');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Heartura',
        cancelLabel: 'Use password',
      });

      if (result.success) {
        haptics.success();
        setStatus('success');
        await new Promise((resolve) => setTimeout(resolve, SUCCESS_DELAY_MS));
        dispatch(unlockSession());
      } else {
        const cancelled = CANCEL_ERRORS.has(result.error);
        if (!cancelled) haptics.error();
        setStatus(cancelled ? 'idle' : 'failed');
      }
    } finally {
      inFlight.current = false;
    }
  }, [dispatch, hasSession]);

  useEffect(() => {
    void unlock();
  }, [unlock]);

  const currentStatus: BiometricUnlockStatus = hasSession ? status : 'noSession';

  return { status: currentStatus, unlock };
}
