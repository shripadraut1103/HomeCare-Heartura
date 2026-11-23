export type ProviderStatus = 'active' | 'inactive';

export interface ProfileContact {
  phone: string;
  email: string;
  homeAddress: string;
}

export interface ProviderLicense {
  state: string;
  number: string;
  expiresOn: string;
}

export interface ProviderAgency {
  name: string;
  officePhone: string;
}

export interface ProfileSignature {
  image: string;
  savedAt?: string;
  changesLeft: number;
  changesMax: number;
}

export interface ProviderProfile {
  firstName: string;
  lastName: string;
  name: string;
  status: ProviderStatus;
  region: string;
  discipline: { code: string; label: string };
  credentials: string;
  npi: string;
  medicaidNumber?: string;
  license: ProviderLicense;
  supervisor?: string;
  agencyStartDate: string;
  contact: ProfileContact;
  agency: ProviderAgency;
  photoUrl?: string;
  signature?: ProfileSignature;
  version?: number;
}

export interface ProfileState {
  profile: ProviderProfile;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export interface SettingsSummary {
  notifications: { enabled: number; total: number };
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface TimeSlot {
  start: string;
  end: string;
}

export interface AvailabilityRange {
  id: string;
  startDate: string;
  endDate: string;
  days: Record<Weekday, TimeSlot[]>;
}

export interface AvailabilityState {
  providerId: string | null;
  version: number | null;
  ranges: AvailabilityRange[];
  updatedAt: string | null;
  updatedBy: string | null;
  loading: boolean;
  loaded: boolean;
  saving: boolean;
  error: string | null;
}

export type AppearancePreference = 'system' | 'light' | 'dark';

export interface PreferencesState {
  appearance: AppearancePreference;
  biometricUnlock: boolean;
  organization: string;
}

export interface BlockedDay {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  hours?: TimeSlot;
  notifyOffice: boolean;
  version: number;
}

export interface BlockDaysState {
  blockedDays: BlockedDay[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}
