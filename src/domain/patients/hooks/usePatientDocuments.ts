import * as WebBrowser from 'expo-web-browser';

import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import type {
  ApiDocumentCategory,
  ApiDocumentSection,
} from '@/domain/patients/interfaces/PatientApi';
import type { PatientDocument } from '@/domain/patients/interfaces/PatientInterfaces';
import { mimeTypeOf, uploadName } from '@/domain/patients/patientDocuments';
import {
  fetchDocumentFileAction,
  uploadDocumentAction,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const OPEN_FAILED = 'Couldn’t open that document.';
const UPLOAD_FAILED = 'Couldn’t upload the document. Try again.';

export type DocumentUploadDetails = {
  section: ApiDocumentSection;
  category: ApiDocumentCategory;
  name: string;
  documentDate: Date | null;
};

export function usePatientDocuments(patientId: string | undefined) {
  const dispatch = useAppDispatch();

  const fail = (message: string) => {
    haptics.error();
    dispatch(setToastMessage({ message, type: 'error' }));
  };

  const open = async (document: PatientDocument) => {
    if (!patientId) return fail(OPEN_FAILED);
    const result = await dispatch(fetchDocumentFileAction({ patientId, documentId: document.id }));
    const payload = fetchDocumentFileAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) return fail(payload?.error || OPEN_FAILED);
    const link = payload.data.url ?? payload.data.download_url;
    if (!link) return fail(OPEN_FAILED);
    try {
      await WebBrowser.openBrowserAsync(link);
    } catch {
      fail(OPEN_FAILED);
    }
  };

  const upload = async (
    files: readonly Attachment[],
    details: DocumentUploadDetails,
    alreadyUploaded = 0
  ): Promise<number> => {
    if (!patientId) {
      fail(UPLOAD_FAILED);
      return 0;
    }
    let uploaded = 0;
    for (const [index, file] of files.entries()) {
      const result = await dispatch(
        uploadDocumentAction({
          patientId,
          upload: {
            section: details.section,
            category: details.category,
            name: uploadName(
              details.name,
              file.name,
              alreadyUploaded + index,
              alreadyUploaded + files.length
            ),
            document_date: details.documentDate ? toIsoDate(details.documentDate) : null,
            file: {
              uri: file.uri,
              name: file.name,
              type: mimeTypeOf(file) ?? 'application/octet-stream',
            },
          },
        })
      );
      const payload = uploadDocumentAction.fulfilled.match(result) ? result.payload : null;
      if (!payload || 'error' in payload) {
        fail(payload?.error || UPLOAD_FAILED);
        break;
      }
      uploaded += 1;
    }
    if (uploaded > 0) haptics.success();
    return uploaded;
  };

  return { open, upload };
}
