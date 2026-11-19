import type { ThemeColor } from '@/constants/Theme';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import type {
  ApiDocumentCategory,
  ApiDocumentSection,
} from '@/domain/patients/interfaces/PatientApi';
import type {
  DocumentStatus,
  PatientDocument,
} from '@/domain/patients/interfaces/PatientInterfaces';

type StatusStyle = { label: string; color: ThemeColor; background: ThemeColor };

export const DOCUMENT_STATUS: Record<DocumentStatus, StatusStyle> = {
  current: { label: 'Current', color: 'success', background: 'successMuted' },
  received: { label: 'Received', color: 'primary', background: 'toneBlueBg' },
  pending: { label: 'Pending', color: 'toneAmberFg', background: 'toneAmberBg' },
  signed: { label: 'Signed', color: 'success', background: 'successMuted' },
  onFile: { label: 'On file', color: 'primary', background: 'toneBlueBg' },
  superseded: { label: 'Superseded', color: 'textSecondary', background: 'backgroundElement' },
};

export function documentStatusPill(document: PatientDocument): StatusStyle {
  const style = DOCUMENT_STATUS[document.status as DocumentStatus] ?? {
    label: document.status,
    color: 'textSecondary',
    background: 'backgroundElement',
  };
  return { ...style, label: document.statusLabel || style.label };
}

export const DOCUMENT_SECTIONS: readonly { value: ApiDocumentSection; label: string }[] = [
  { value: 'providers', label: 'Shared with providers' },
  { value: 'back_office', label: 'Back office' },
];

export const DOCUMENT_TYPES: readonly { value: ApiDocumentCategory; label: string }[] = [
  { value: 'isp', label: 'ISP' },
  { value: 'treatment_plan', label: 'Treatment plan' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'other', label: 'Other' },
];

export const UPLOAD_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const EXTENSION_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

export const mimeTypeOf = (file: Attachment) =>
  file.mimeType ?? EXTENSION_TYPES[file.name.split('.').pop()?.toLowerCase() ?? ''];

export function checkUploads(files: readonly Attachment[]) {
  const accepted = files.filter(
    (file) =>
      UPLOAD_TYPES.includes(mimeTypeOf(file) ?? '') &&
      (file.size === undefined || file.size <= MAX_UPLOAD_BYTES)
  );
  return { accepted, rejected: files.length - accepted.length };
}

const withoutExtension = (name: string) => name.replace(/\.[^.]+$/, '');

export function uploadName(name: string, fileName: string, index: number, count: number) {
  const trimmed = name.trim();
  if (!trimmed) return withoutExtension(fileName);
  return count > 1 ? `${trimmed} (${index + 1})` : trimmed;
}
