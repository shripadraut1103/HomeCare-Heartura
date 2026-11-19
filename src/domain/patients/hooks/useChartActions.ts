import type {
  ApiAllergyCreate,
  ApiCoverageCreate,
  ApiDiagnosisCreate,
  ApiHistoryCreate,
} from '@/domain/patients/interfaces/PatientApi';
import { noteTitle } from '@/domain/patients/patientChartMapper';
import {
  createAllergyAction,
  createCoverageAction,
  createDiagnosisAction,
  createHistoryAction,
  createNoteAction,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import type { ServiceResult } from '@/types/ServiceInterfaces';
import { toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const FAILED = 'Couldn’t save. Try again.';

export function useChartActions(patientId: string | undefined) {
  const dispatch = useAppDispatch();

  const fail = (message?: string) => {
    haptics.error();
    dispatch(setToastMessage({ message: message || FAILED, type: 'error' }));
    return false;
  };

  const settle = async (pending: Promise<{ payload?: unknown }>) => {
    const { payload } = await pending;
    const result = payload as ServiceResult<unknown> | undefined;
    if (!result || 'error' in result) return fail(result?.error);
    haptics.success();
    return true;
  };

  return {
    addDiagnosis: (body: ApiDiagnosisCreate) =>
      patientId ? settle(dispatch(createDiagnosisAction({ patientId, body }))) : fail(),
    addAllergy: (body: ApiAllergyCreate) =>
      patientId ? settle(dispatch(createAllergyAction({ patientId, body }))) : fail(),
    addHistory: (body: ApiHistoryCreate) =>
      patientId ? settle(dispatch(createHistoryAction({ patientId, body }))) : fail(),
    addCoverage: (body: ApiCoverageCreate) =>
      patientId ? settle(dispatch(createCoverageAction({ patientId, body }))) : fail(),
    addNote: (text: string, critical: boolean) =>
      patientId
        ? settle(
            dispatch(
              createNoteAction({
                patientId,
                body: {
                  title: noteTitle(text),
                  note_date: toIsoDate(new Date()),
                  text: text.trim(),
                  is_critical: critical,
                },
              })
            )
          )
        : fail(),
  };
}
