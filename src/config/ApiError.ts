import { isAxiosError } from 'axios';

import type { ServiceError, ServiceResult } from '@/types/ServiceInterfaces';

export type ApiErrorCode =
  | 'AUTH_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'MEMBER_INACTIVE'
  | 'TWO_FACTOR_INVALID'
  | 'TWO_FACTOR_EXPIRED'
  | 'AUTH_EXPIRED'
  | 'AUTH_REQUIRED'
  | 'TENANT_MISMATCH'
  | 'TENANT_REQUIRED'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR'
  | 'EDIT_CONFLICT'
  | 'SCHEDULE_CONFLICT'
  | 'UNITS_EXCEEDED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

const MESSAGES = {
  network: 'Can’t reach the server. Check your connection and try again.',
  timeout: 'The server took too long to answer. Please try again.',
  server: 'Something went wrong on our side. Please try again.',
  unknown: 'Something went wrong. Please try again.',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function fieldMessages(details: Record<string, unknown>): Record<string, string[]> {
  if (!isRecord(details.fields)) return {};
  return Object.fromEntries(
    Object.entries(details.fields).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.filter((item) => typeof item === 'string') : [],
    ])
  );
}

export function serviceError(
  code: ApiErrorCode,
  message: string,
  status: number | null = null,
  details: Record<string, unknown> = {}
): ServiceError {
  return { error: message, code, status, details, fields: fieldMessages(details) };
}

export function toServiceError(error: unknown): ServiceError {
  if (!isAxiosError(error)) return serviceError('UNKNOWN_ERROR', MESSAGES.unknown);

  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      ? serviceError('TIMEOUT', MESSAGES.timeout)
      : serviceError('NETWORK_ERROR', MESSAGES.network);
  }

  const { status, data, headers } = error.response;
  const body = isRecord(data) && isRecord(data.error) ? data.error : null;
  const details = body && isRecord(body.details) ? body.details : {};
  const result =
    body && typeof body.message === 'string' && typeof body.code === 'string'
      ? { ...serviceError('UNKNOWN_ERROR', body.message, status, details), code: body.code }
      : serviceError(
          status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR',
          status >= 500 ? MESSAGES.server : MESSAGES.unknown,
          status
        );

  const retryAfter = Number(headers?.['retry-after']);
  return Number.isFinite(retryAfter) && retryAfter > 0 ? { ...result, retryAfter } : result;
}

export async function callApi<T>(request: () => Promise<T>): Promise<ServiceResult<T>> {
  try {
    return { data: await request() };
  } catch (error) {
    return toServiceError(error);
  }
}
