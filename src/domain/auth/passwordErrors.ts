import type { ServiceError } from '@/types/ServiceInterfaces';

const toMessages = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');
  return [];
};

export function newPasswordError(result: ServiceError): string | undefined {
  const messages = [
    ...toMessages(result.details.password),
    ...(result.fields.new_password ?? []),
    ...(result.fields.password ?? []),
  ];
  if (messages.length > 0) return messages.join('\n');
  return result.code === 'PASSWORD_POLICY' ? result.error : undefined;
}
