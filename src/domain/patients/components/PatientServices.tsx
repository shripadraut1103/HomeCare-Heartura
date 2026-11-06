import { useState } from 'react';

import { Pill } from '@/components/ui/Pill';
import type { ThemeColor } from '@/constants/Theme';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import { DetailGrid, ExpandableRow } from '@/domain/patients/components/ExpandableRow';
import type { PatientService, ServiceStatus } from '@/domain/patients/interfaces/PatientInterfaces';

const STATUS: Record<ServiceStatus, { label: string; color: ThemeColor; background: ThemeColor }> =
  {
    active: { label: 'Active', color: 'success', background: 'successMuted' },
    privatePay: { label: 'Private pay', color: 'primary', background: 'toneBlueBg' },
    onHold: { label: 'On hold', color: 'toneAmberFg', background: 'toneAmberBg' },
    ended: { label: 'Ended', color: 'textSecondary', background: 'backgroundElement' },
  };

const unitsText = (service: PatientService) =>
  service.units
    ? `Used ${service.units.used} of ${service.units.total} · accrued ${service.units.accrued} · missed ${service.units.missed} · makeup ${service.units.makeup}`
    : 'Not tracked · private pay';

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
        const status = STATUS[service.status];
        return (
          <ExpandableRow
            key={service.id}
            isFirst={index === 0}
            title={service.name}
            subtitle={`${service.start} – ${service.end}`}
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
                { label: 'Plan dates', value: `${service.start} – ${service.end}` },
                { label: 'Payer', value: service.payer },
                { label: 'Units', value: unitsText(service) },
                { label: 'Team', value: service.team.join(', ') },
              ]}
            />
          </ExpandableRow>
        );
      })}
    </PatientCardShell>
  );
}
