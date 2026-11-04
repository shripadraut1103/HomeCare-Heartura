import type {
  Attachment,
  Message,
} from '@/domain/communications/interfaces/CommunicationInterfaces';

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const UNITS = ['KB', 'MB', 'GB'];

export function formatFileSize(bytes: number | undefined) {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${UNITS[unit]}`;
}

export function fileExtension(name: string) {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : '';
}

export function attachmentSummary(attachments: Attachment[]) {
  if (attachments.length === 0) return '';
  const images = attachments.filter((attachment) => attachment.kind === 'image').length;
  if (images === attachments.length) return images === 1 ? '📎 Photo' : `📎 ${images} photos`;
  if (attachments.length === 1) return `📎 ${attachments[0].name}`;
  return `📎 ${attachments.length} attachments`;
}

export const messageSummary = (message: Message) =>
  message.body || attachmentSummary(message.attachments ?? []);

export function addAttachments(current: Attachment[], picked: Attachment[]) {
  const accepted = picked.filter(
    (attachment) => attachment.size === undefined || attachment.size <= MAX_ATTACHMENT_BYTES
  );
  const room = Math.max(0, MAX_ATTACHMENTS - current.length);
  return {
    attachments: [...current, ...accepted.slice(0, room)],
    tooLarge: picked.length - accepted.length,
    overLimit: Math.max(0, accepted.length - room),
  };
}
