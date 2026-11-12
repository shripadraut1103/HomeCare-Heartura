import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { nanoid } from '@reduxjs/toolkit';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import {
  OptionListSheet,
  type OptionListSheetData,
  type SheetOption,
} from '@/components/sheet/OptionListSheet';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import { usePendingNotes, useProgressNotesDue } from '@/domain/notes/hooks/useNotes';
import type { PendingNote } from '@/domain/notes/interfaces/NoteInterfaces';
import { addPendingNote, addProgressNoteDue } from '@/domain/notes/store/NotesReducer';
import { RecordList } from '@/domain/patients/components/RecordList';
import { useRoutePatient } from '@/domain/patients/hooks/usePatients';
import type { ChartRecord, RecordDiscipline } from '@/domain/patients/interfaces/PatientInterfaces';
import {
  buildPendingNote,
  buildProgressNoteDue,
  recordsForTab,
  type DocumentationTab,
} from '@/domain/patients/patientRecords';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate, formatTime } from '@/utils/dateFormat';

const TABS: readonly Segment<DocumentationTab>[] = [
  { value: 'daily', label: 'Daily notes' },
  { value: 'evaluation', label: 'Evaluation & care plan' },
  { value: 'progress', label: 'Progress notes' },
  { value: 'discharge', label: 'Discharge notes' },
];

const EMPTY: Record<DocumentationTab, string> = {
  daily: 'No daily notes yet.',
  evaluation: 'No evaluations or care plans yet.',
  progress: 'No progress notes yet.',
  discharge: 'No discharge notes yet.',
};

const DOC_ICON = { ios: 'doc', android: 'description' } as const;

const option = (
  key: string,
  label: string,
  color: SheetOption['color'],
  background: SheetOption['background']
): SheetOption => ({ key, label, icon: DOC_ICON, color, background });

const NEW_OPTIONS: Record<Exclude<DocumentationTab, 'daily'>, readonly SheetOption[]> = {
  evaluation: [
    option('OT:evaluation', 'OT evaluation', 'toneBlueFg', 'toneBlueBg'),
    option('PT:evaluation', 'PT evaluation', 'toneAmberFg', 'toneAmberBg'),
    option('OT:carePlan', 'OT care plan', 'accent', 'toneTealBg'),
    option('PT:carePlan', 'PT care plan', 'tonePurpleFg', 'tonePurpleBg'),
  ],
  progress: [
    option('OT:progress', 'OT progress / discharge note', 'toneBlueFg', 'toneBlueBg'),
    option('PT:progress', 'PT progress / discharge note', 'toneAmberFg', 'toneAmberBg'),
  ],
  discharge: [
    option('OT:discharge', 'OT discharge note', 'toneBlueFg', 'toneBlueBg'),
    option('PT:discharge', 'PT discharge note', 'toneAmberFg', 'toneAmberBg'),
  ],
};

const DISCIPLINES: readonly RecordDiscipline[] = ['OT', 'PT', 'Speech'];

const toDiscipline = (value: string): RecordDiscipline =>
  DISCIPLINES.find((discipline) => discipline === value) ?? 'PT';

const EDITOR = {
  evaluation: '/evaluation/[id]',
  carePlan: '/care-plan/[id]',
  daily: '/daily-note/[id]',
} as const;

const PENDING_PREFIX = 'pending:';
const DUE_PREFIX = 'due:';

export default function PatientDocumentationScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tabBarSpace = useTabBarSpace();
  const provider = useProfile();
  const { patient, chart } = useRoutePatient();
  const pendingNotes = usePendingNotes();
  const dueNotes = useProgressNotesDue();
  const newSheet = useRef<BottomSheetModal<OptionListSheetData>>(null);
  const [tab, setTab] = useState<DocumentationTab>('daily');

  if (!patient || !chart) return null;

  const pendingRecords: ChartRecord[] = pendingNotes
    .filter((note): note is PendingNote & { draft: NonNullable<PendingNote['draft']> } =>
      Boolean(note.patientId === patient.id && note.draft && note.kind !== 'coSign')
    )
    .map((note) => {
      const at = new Date(note.draft.visitAt);
      return {
        id: `${PENDING_PREFIX}${note.id}`,
        kind:
          note.kind === 'dailyNote'
            ? 'daily'
            : note.kind === 'carePlan'
              ? 'carePlan'
              : 'evaluation',
        discipline: toDiscipline(note.draft.discipline),
        title: note.label,
        date: formatNumericDate(at),
        time: formatTime(at).toLowerCase(),
        therapist: provider.name,
        status: 'pending',
        visitType: 'Daily visit',
        minutes: 0,
      };
    });

  const dueRecords: ChartRecord[] = dueNotes
    .filter((note) => note.patientId === patient.id)
    .map((note) => ({
      id: `${DUE_PREFIX}${note.id}`,
      kind: 'progress',
      discipline: toDiscipline(note.discipline),
      title: `${note.discipline} progress note`,
      date: note.servicePeriod.end,
      therapist: note.therapist,
      status: 'due',
      periodStart: note.servicePeriod.start,
      periodEnd: note.servicePeriod.end,
      visitNumber: note.visitsCompleted,
      visitsPerNote: note.visitsPerNote,
      createdOn: formatNumericDate(new Date(note.visitAt)),
    }));

  const chartIds = new Set(dueNotes.map((note) => note.id));
  const visibleRecords = (current: DocumentationTab) => [
    ...pendingRecords.filter((record) =>
      current === 'daily'
        ? record.kind === 'daily'
        : current === 'evaluation' && record.kind !== 'daily'
    ),
    ...(current === 'progress'
      ? dueRecords.filter((record) => !record.id.startsWith(`${DUE_PREFIX}chart-`))
      : []),
    ...recordsForTab(chart.records, current),
  ];

  const openProgressEditor = (discipline: RecordDiscipline, record?: ChartRecord) => {
    const id = record ? `chart-${record.id}` : nanoid();
    if (!chartIds.has(id))
      dispatch(
        addProgressNoteDue(
          buildProgressNoteDue(id, patient, chart, discipline, provider.name, record)
        )
      );
    router.push({ pathname: '/progress-note/[id]', params: { id } });
  };

  const open = (record: ChartRecord) => {
    if (record.id.startsWith(PENDING_PREFIX)) {
      const kind =
        record.kind === 'daily' ? 'daily' : record.kind === 'carePlan' ? 'carePlan' : 'evaluation';
      router.push({
        pathname: EDITOR[kind],
        params: { id: record.id.slice(PENDING_PREFIX.length) },
      });
    } else if (record.id.startsWith(DUE_PREFIX)) {
      router.push({
        pathname: '/progress-note/[id]',
        params: { id: record.id.slice(DUE_PREFIX.length) },
      });
    } else if (record.status === 'due') {
      openProgressEditor(record.discipline, record);
    } else {
      router.push({
        pathname: '/chart-note',
        params: { patientId: patient.id, recordId: record.id },
      });
    }
  };

  const startNote = (
    kind: 'evaluation' | 'carePlan' | 'dailyNote',
    discipline: RecordDiscipline
  ) => {
    // TODO: create the draft through the notes API once it exists.
    const note = buildPendingNote(nanoid(), patient, chart, kind, discipline);
    dispatch(addPendingNote(note));
    router.push({
      pathname: kind === 'dailyNote' ? EDITOR.daily : EDITOR[kind],
      params: { id: note.id },
    });
  };

  const pick = (key: string) => {
    const [discipline, kind] = key.split(':');
    if (kind === 'evaluation' || kind === 'carePlan') startNote(kind, toDiscipline(discipline));
    else openProgressEditor(toDiscipline(discipline));
  };

  const fab =
    tab === 'daily'
      ? {
          label: 'New visit note',
          onPress: () =>
            startNote(
              'dailyNote',
              toDiscipline(patient.discipline.split(' · ').find((item) => item !== 'DSP') ?? 'PT')
            ),
        }
      : {
          label: 'New',
          onPress: () => newSheet.current?.present({ title: 'New', options: NEW_OPTIONS[tab] }),
        };

  return (
    <View style={styles.container}>
      <View style={[styles.band, { backgroundColor: theme.backgroundScreen }]}>
        <SegmentedControl scrollable segments={TABS} value={tab} onChange={setTab} />
      </View>
      <TabPanel tab={tab}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: tabBarSpace + FLOATING_ACTION_BUTTON_SIZE },
          ]}
          showsVerticalScrollIndicator={false}>
          <RecordList
            key={tab}
            records={visibleRecords(tab)}
            carePlans={chart.records.filter((record) => record.kind === 'carePlan')}
            empty={EMPTY[tab]}
            onOpen={open}
          />
        </ScrollView>
      </TabPanel>
      <View style={[styles.fab, { bottom: tabBarSpace - Spacing.two }]}>
        <FloatingActionButton
          label={fab.label}
          accessibilityLabel={fab.label}
          onPress={fab.onPress}
        />
      </View>
      <OptionListSheet ref={newSheet} onPick={pick} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  band: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
  },
});
