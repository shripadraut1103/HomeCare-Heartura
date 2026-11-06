import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { buildUploads, checkUploads, MAX_UPLOAD_BYTES } from '@/domain/patients/patientDocuments';

const file = (name: string, size = 1000, mimeType?: string): Attachment => ({
  id: name,
  kind: 'file',
  uri: `file:///${name}`,
  name,
  size,
  mimeType,
});

const details = {
  name: '',
  kind: 'ISP',
  section: 'Shared with providers',
  documentDate: '09/03/2026',
  uploadedOn: '11/06/2026',
  author: 'Helena Ruiz, DPT',
};

describe('patientDocuments', () => {
  it('accepts PDF, JPG and PNG files up to 25 MB', () => {
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
    expect(buildUploads([file('ISP_2026.pdf')], details)[0]).toMatchObject({
      title: 'ISP_2026',
      kind: 'ISP',
      status: 'onFile',
      mimeType: 'application/pdf',
    });
    expect(
      buildUploads([file('a.pdf'), file('b.pdf')], { ...details, name: 'Referral' }).map(
        (document) => document.title
      )
    ).toEqual(['Referral (1)', 'Referral (2)']);
  });
});
