import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import {
  checkUploads,
  documentStatusPill,
  MAX_UPLOAD_BYTES,
  uploadName,
} from '@/domain/patients/patientDocuments';

const file = (name: string, size = 1000, mimeType?: string): Attachment => ({
  id: name,
  kind: 'file',
  uri: `file:///${name}`,
  name,
  size,
  mimeType,
});

describe('patientDocuments', () => {
  it('accepts PDF, JPG and PNG files up to 10 MB', () => {
    const { accepted, rejected } = checkUploads([
      file('plan.pdf'),
      file('photo.JPG'),
      file('notes.docx'),
      file('scan.png', MAX_UPLOAD_BYTES + 1),
    ]);
    expect(accepted.map((item) => item.name)).toEqual(['plan.pdf', 'photo.JPG']);
    expect(rejected).toBe(2);
  });

  it('names a document after its file unless a name is given', () => {
    expect(uploadName('', 'ISP_2026.pdf', 0, 1)).toBe('ISP_2026');
    expect(uploadName(' Referral ', 'a.pdf', 0, 1)).toBe('Referral');
    expect(uploadName('Lab report', 'b.pdf', 1 + 0, 1 + 2)).toBe('Lab report (2)');
    expect(uploadName('Referral', 'b.pdf', 1, 2)).toBe('Referral (2)');
  });

  it('prefers the API label and shows unknown statuses as is', () => {
    const base = { id: 'd1', title: 'ISP', kind: 'ISP', author: 'Kim', date: '' };
    expect(
      documentStatusPill({ ...base, status: 'pending', statusLabel: 'Awaiting' })
    ).toMatchObject({ label: 'Awaiting', color: 'toneAmberFg' });
    expect(documentStatusPill({ ...base, status: 'archived' })).toMatchObject({
      label: 'archived',
      color: 'textSecondary',
    });
  });
});
