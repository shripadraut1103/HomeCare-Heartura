import { useState } from 'react';

import { Pill } from '@/components/ui/Pill';
import type { ThemeColor } from '@/constants/Theme';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import { DetailGrid, ExpandableRow } from '@/domain/patients/components/ExpandableRow';
import { EMPTY_VALUE } from '@/domain/patients/components/ChartListParts';
import type { PatientService } from '@/domain/patients/interfaces/PatientInterfaces';

type StatusStyle = { label: string; color: ThemeColor; background: ThemeColor };

const STATUS: Record<string, StatusStyle> = {
  seeking: { label: 'Seeking coverage', color: 'toneAmberFg', background: 'toneAmberBg' },
  assigned: { label: 'Assigned', color: 'primary', background: 'toneBlueBg' },
  active: { label: 'Active', color: 'success', background: 'successMuted' },
  discharged: { label: 'Discharged', color: 'textSecondary', background: 'backgroundElement' },
};

const statusStyle = (service: PatientService): StatusStyle => {
  const style = STATUS[service.status] ?? {
    label: service.status,
    color: 'textSecondary',
    background: 'backgroundElement',
  };
  return { ...style, label: service.statusLabel || style.label };
};

const count = (value: number | null) => (value === null ? EMPTY_VALUE : String(value));

const unitsText = (service: PatientService) =>
  service.units
    ? `Used ${service.units.used} of ${count(service.units.total)} · accrued ${count(service.units.accrued)} · missed ${service.units.missed} · makeup ${count(service.units.makeup)}`
    : 'No current authorization';

const dates = (service: PatientService) =>
  service.start || service.end
    ? `${service.start || EMPTY_VALUE} – ${service.end || EMPTY_VALUE}`
    : EMPTY_VALUE;

export function PatientServices({ services }: { services: readonly PatientService[] }) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <PatientCardShell>
      {services.map((service, index) => {
        const status = statusStyle(service);
        return (
          <ExpandableRow
            key={service.id}
            isFirst={index === 0}
            title={service.name}
            subtitle={dates(service)}
            expanded={expanded.has(service.id)}
            onToggle={() => toggle(service.id)}
            trailing={
              <Pill
                label={status.label}
                dot
                color={status.color}
                backgroundColor={status.background}
              />
            }>
            <DetailGrid
              items={[
                { label: 'Plan dates', value: dates(service) },
                { label: 'Payer', value: service.payer || EMPTY_VALUE },
                { label: 'Units', value: unitsText(service) },
                { label: 'Team', value: service.team.join(', ') || EMPTY_VALUE },
              ]}
            />
          </ExpandableRow>
        );
      })}
    </PatientCardShell>
  );
}
