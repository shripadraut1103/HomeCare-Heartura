import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { callApi, toServiceError } from '@/config/ApiError';

const responseError = (status: number, data: unknown, headers: Record<string, string> = {}) => {
  const config = { headers: new AxiosHeaders() };
  const response = { status, data, headers, config, statusText: '' } as AxiosResponse;
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response);
};

describe('toServiceError', () => {
  it('reads the server’s error envelope', () => {
    const result = toServiceError(
      responseError(401, {
        error: {
          message: 'Too many attempts.',
          code: 'ACCOUNT_LOCKED',
          details: { locked_until: '2026-11-17T10:15:00+05:30' },
        },
      })
    );
    expect(result).toEqual({
      error: 'Too many attempts.',
      code: 'ACCOUNT_LOCKED',
      status: 401,
      details: { locked_until: '2026-11-17T10:15:00+05:30' },
      fields: {},
    });
  });

  it('collects field messages from validation errors', () => {
    const result = toServiceError(
      responseError(400, {
        error: {
          message: 'Check the highlighted fields.',
          code: 'VALIDATION_ERROR',
          details: { fields: { email: ['Enter a valid email address.'] } },
        },
      })
    );
    expect(result.fields).toEqual({ email: ['Enter a valid email address.'] });
  });

  it('keeps how long to wait when rate limited', () => {
    const result = toServiceError(
      responseError(
        429,
        { error: { message: 'Slow down.', code: 'RATE_LIMITED', details: {} } },
        { 'retry-after': '30' }
      )
    );
    expect(result.retryAfter).toBe(30);
  });

  it('gives a generic message when the reply isn’t the envelope', () => {
    expect(toServiceError(responseError(502, '<html>Bad gateway</html>'))).toMatchObject({
      code: 'SERVER_ERROR',
      status: 502,
    });
  });

  it('tells a missing connection apart from a timeout', () => {
    expect(toServiceError(new AxiosError('Network Error', 'ERR_NETWORK')).code).toBe(
      'NETWORK_ERROR'
    );
    expect(toServiceError(new AxiosError('timeout', 'ECONNABORTED')).code).toBe('TIMEOUT');
    expect(toServiceError(new Error('boom')).code).toBe('UNKNOWN_ERROR');
  });
});

describe('callApi', () => {
  it('wraps success in data and failures in a service error', async () => {
    await expect(callApi(async () => 'ok')).resolves.toEqual({ data: 'ok' });
    await expect(
      callApi(async () => {
        throw new AxiosError('Network Error', 'ERR_NETWORK');
      })
    ).resolves.toMatchObject({ code: 'NETWORK_ERROR', status: null });
  });
});
