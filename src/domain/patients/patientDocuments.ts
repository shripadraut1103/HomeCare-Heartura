import type { ThemeColor } from '@/constants/Theme';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import type {
  DocumentStatus,
  PatientDocument,
} from '@/domain/patients/interfaces/PatientInterfaces';

export const DOCUMENT_STATUS: Record<
  DocumentStatus,
  { label: string; color: ThemeColor; background: ThemeColor }
> = {
  current: { label: 'Current', color: 'success', background: 'successMuted' },
  signed: { label: 'Signed', color: 'success', background: 'successMuted' },
  onFile: { label: 'On file', color: 'primary', background: 'toneBlueBg' },
  superseded: { label: 'Superseded', color: 'textSecondary', background: 'backgroundElement' },
};

export const DOCUMENT_SECTIONS = ['Shared with providers', 'Agency only', 'Patient & family'];

export const DOCUMENT_TYPES = [
  'ISP',
  'Treatment plan',
  'Prescription',
  'Referral',
  'Assessment',
  'Consent',
  'Other',
];

export const UPLOAD_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const EXTENSION_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

const typeOf = (file: Attachment) =>
  file.mimeType ?? EXTENSION_TYPES[file.name.split('.').pop()?.toLowerCase() ?? ''];

export function checkUploads(files: readonly Attachment[]) {
  const accepted = files.filter(
    (file) =>
      UPLOAD_TYPES.includes(typeOf(file) ?? '') &&
      (file.size === undefined || file.size <= MAX_UPLOAD_BYTES)
  );
  return { accepted, rejected: files.length - accepted.length };
}

const withoutExtension = (name: string) => name.replace(/\.[^.]+$/, '');

type UploadDetails = {
  name: string;
  kind: string;
  section: string;
  documentDate: string;
  uploadedOn: string;
  author: string;
};

export function buildUploads(
  files: readonly Attachment[],
  details: UploadDetails
): Omit<PatientDocument, 'id'>[] {
  const name = details.name.trim();
  return files.map((file, index) => ({
    title: name
      ? files.length > 1
        ? `${name} (${index + 1})`
        : name
      : withoutExtension(file.name),
    kind: details.kind,
    author: details.author,
    status: 'onFile',
    date: details.uploadedOn,
    documentDate: details.documentDate,
    section: details.section,
    fileName: file.name,
    mimeType: typeOf(file),
    uri: file.uri,
  }));
}
