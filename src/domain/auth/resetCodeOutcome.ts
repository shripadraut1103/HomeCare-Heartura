import type { ResetCodeVerified } from '@/domain/auth/interfaces/AuthInterfaces';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const RESET_CODE_EXPIRED_MESSAGE =
  'This code has expired or can’t be used anymore. Send a new code to continue.';

export type ResetCodeOutcome =
  | { kind: 'verified'; token: string }
  | { kind: 'invalid'; message: string }
  | { kind: 'expired'; message: string };

export function resetCodeOutcome(result: ServiceResult<ResetCodeVerified>): ResetCodeOutcome {
  if (!('error' in result)) return { kind: 'verified', token: result.data.reset_token };
  if (result.code === 'RESET_CODE_EXPIRED') {
    return { kind: 'expired', message: RESET_CODE_EXPIRED_MESSAGE };
  }
  return { kind: 'invalid', message: result.error };
}
