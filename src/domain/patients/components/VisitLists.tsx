import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/Theme';
import { INCIDENT_STATUS } from '@/domain/patients/clinicalStyles';
import { EMPTY_VALUE, EmptyRow, StatusPill } from '@/domain/patients/components/ChartListParts';
import { DetailGrid, ExpandableRow, ROW_ACCENTS } from '@/domain/patients/components/ExpandableRow';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import type { PatientIncident } from '@/domain/patients/interfaces/PatientInterfaces';
import { disciplineCode } from '@/domain/patients/patientRecords';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import { VISIT_STATUS } from '@/domain/visits/visitStatus';
import { useExpandedSet } from '@/hooks/useExpandedSet';
import { useTheme } from '@/hooks/useTheme';
import { formatNumericDate, formatTime } from '@/utils/dateFormat';

const COLLAPSED_COUNT = 4;

const clock = (iso: string) => formatTime(new Date(iso)).toLowerCase();

function ShowAll({
  total,
  showAll,
  onToggle,
}: {
  total: number;
  showAll: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  if (total <= COLLAPSED_COUNT) return null;

  return (
    <View style={[styles.showAll, { borderTopColor: theme.border }]}>
      <Button
        variant="link"
        color="accent"
        title={showAll ? 'Show less' : `Show all ${total}`}
        onPress={onToggle}
      />
    </View>
  );
}

export function AppointmentList({ visits }: { visits: readonly Visit[] }) {
  const { expanded, toggle } = useExpandedSet();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? visits : visits.slice(0, COLLAPSED_COUNT);

  return (
    <PatientCardShell>
      {visits.length === 0 ? (
        <EmptyRow text="No appointments yet." />
      ) : (
        visible.map((visit, index) => {
          const service = `${visit.visitType} · ${disciplineCode(visit.discipline)}`;
          return (
            <ExpandableRow
              key={visit.id}
              isFirst={index === 0}
              accent={ROW_ACCENTS[index % ROW_ACCENTS.length]}
              title={formatNumericDate(new Date(visit.startsAt))}
              subtitle={`${clock(visit.startsAt)} · ${service}`}
              expanded={expanded.has(visit.id)}
              onToggle={() => toggle(visit.id)}
              trailing={<StatusPill pill={VISIT_STATUS[visit.status]} />}>
              <DetailGrid
                items={[
                  { label: 'Time', value: clock(visit.startsAt) },
                  { label: 'Service', value: service },
                  { label: 'Provider', value: visit.providerName },
                  { label: 'Location', value: visit.location || EMPTY_VALUE },
                  ...(visit.status === 'completed'
                    ? [{ label: 'Units & billing', value: visit.units.summary }]
                    : []),
                ]}
              />
            </ExpandableRow>
          );
        })
      )}
      <ShowAll
        total={visits.length}
        showAll={showAll}
        onToggle={() => setShowAll((current) => !current)}
      />
    </PatientCardShell>
  );
}

export function IncidentList({ incidents }: { incidents: readonly PatientIncident[] }) {
  const { expanded, toggle } = useExpandedSet();

  return (
    <PatientCardShell>
      {incidents.length === 0 ? (
        <EmptyRow text="No incidents reported." />
      ) : (
        incidents.map((incident, index) => {
          const when = `${formatNumericDate(new Date(incident.occurredAt))} · ${clock(incident.occurredAt)}`;
          const type = [incident.type, incident.location].filter(Boolean).join(' · ');
          return (
            <ExpandableRow
              key={incident.id}
              isFirst={index === 0}
              accent={ROW_ACCENTS[index % ROW_ACCENTS.length]}
              title={incident.code}
              subtitle={[incident.description, when, incident.type].filter(Boolean).join(' · ')}
              expanded={expanded.has(incident.id)}
              onToggle={() => toggle(incident.id)}
              trailing={
                incident.status ? <StatusPill pill={INCIDENT_STATUS[incident.status]} /> : undefined
              }>
              <DetailGrid
                items={[
                  { label: 'Date', value: when },
                  { label: 'Type', value: type || EMPTY_VALUE },
                  { label: 'Injury', value: incident.injury ?? EMPTY_VALUE },
                  { label: 'Reported by', value: incident.reportedBy },
                  ...(incident.witnessedBy
                    ? [{ label: 'Witnessed by', value: incident.witnessedBy }]
                    : []),
                  ...(incident.actionTaken
                    ? [{ label: 'Action taken', value: incident.actionTaken }]
                    : []),
                ]}
              />
            </ExpandableRow>
          );
        })
      )}
    </PatientCardShell>
  );
}

const styles = StyleSheet.create({
  showAll: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
