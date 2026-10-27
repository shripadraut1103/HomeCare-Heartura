/**
 * Services never throw. On failure they resolve to a `ServiceError`, so thunks
 * and screens branch on `'error' in result` instead of try/catch.
 */
export interface ServiceError {
  error: string;
  status: number | null;
}

export interface ServiceSuccess<T> {
  data: T;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;
