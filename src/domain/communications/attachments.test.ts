import {
  addAttachments,
  attachmentSummary,
  fileExtension,
  formatFileSize,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
} from '@/domain/communications/attachments';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';

const make = (id: string, kind: Attachment['kind'] = 'image', size = 1000): Attachment => ({
  id,
  kind,
  uri: `file:///${id}`,
  name: kind === 'image' ? `${id}.jpg` : `${id}.pdf`,
  size,
});

describe('attachments', () => {
  it('formats file sizes', () => {
    expect(formatFileSize(undefined)).toBe('');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(MAX_ATTACHMENT_BYTES)).toBe('10 MB');
  });

  it('reads the file extension', () => {
    expect(fileExtension('Care plan.pdf')).toBe('PDF');
    expect(fileExtension('README')).toBe('');
  });

  it('summarizes photos and files', () => {
    expect(attachmentSummary([make('a')])).toBe('📎 Photo');
    expect(attachmentSummary([make('a'), make('b')])).toBe('📎 2 photos');
    expect(attachmentSummary([make('plan', 'file')])).toBe('📎 plan.pdf');
    expect(attachmentSummary([make('a'), make('plan', 'file')])).toBe('📎 2 attachments');
  });

  it('drops files that are too large and caps the count', () => {
    const current = Array.from({ length: MAX_ATTACHMENTS - 1 }, (_, i) => make(`c${i}`));
    const result = addAttachments(current, [
      make('big', 'file', MAX_ATTACHMENT_BYTES + 1),
      make('x'),
      make('y'),
    ]);

    expect(result.attachments).toHaveLength(MAX_ATTACHMENTS);
    expect(result.tooLarge).toBe(1);
    expect(result.overLimit).toBe(1);
  });
});
