import type { ApiMyProfile, ApiProfileAddress } from '@/domain/profile/interfaces/ProfileApi';
import type { ProviderProfile } from '@/domain/profile/interfaces/ProfileInterfaces';

const DISCIPLINES: Record<string, { code: string; label: string }> = {
  ot: { code: 'OT', label: 'Occupational therapist' },
  pt: { code: 'PT', label: 'Physical therapist' },
  speech: { code: 'ST', label: 'Speech therapist' },
  dsp: { code: 'DSP', label: 'Direct support professional' },
};

export const emptyProfile = (): ProviderProfile => ({
  firstName: '',
  lastName: '',
  name: '',
  status: 'active',
  region: '',
  discipline: { code: '', label: '' },
  credentials: '',
  npi: '',
  license: { state: '', number: '', expiresOn: '' },
  agencyStartDate: '',
  contact: { phone: '', email: '', homeAddress: '' },
  agency: { name: '', officePhone: '' },
});

export const formatAddress = (address: ApiProfileAddress | null | undefined) => {
  if (!address) return '';
  const street = [address.line1, address.line2].filter(Boolean).join(', ');
  const stateZip = [address.state, address.zip].filter(Boolean).join(' ');
  return [street, address.city, stateZip].filter(Boolean).join(', ');
};

export function toProfile(api: ApiMyProfile): ProviderProfile {
  const member = api.member;
  const discipline = member?.discipline ?? '';
  const known = DISCIPLINES[discipline.toLowerCase()];
  return {
    ...emptyProfile(),
    firstName: api.first_name,
    lastName: api.last_name,
    name: `${api.first_name} ${api.last_name}`.trim(),
    region: member?.address?.city ?? '',
    discipline: {
      code: known?.code ?? discipline.toUpperCase(),
      label: member?.job_title || known?.label || member?.role_name || '',
    },
    credentials: member?.licence_type ?? '',
    npi: member?.npi ?? '',
    medicaidNumber: member?.medicaid_number || undefined,
    license: {
      state: member?.address?.state ?? '',
      number: member?.state_licence_number ?? '',
      expiresOn: member?.state_licence_expiry ?? '',
    },
    supervisor: member?.supervisor_name || undefined,
    contact: {
      phone: api.phone,
      email: api.email,
      homeAddress: formatAddress(member?.address),
    },
    agency: { name: member?.organization_name ?? '', officePhone: '' },
    photoUrl: api.photo_url ?? undefined,
    signature: api.signature
      ? {
          image: api.signature.value,
          savedAt: api.signature.saved_at ?? undefined,
          changesLeft: api.signature.changes_left,
          changesMax: api.signature.changes_max,
        }
      : undefined,
    version: api.version,
  };
}
