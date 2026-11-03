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

export interface ProviderProfile {
  name: string;
  status: ProviderStatus;
  region: string;
  discipline: { code: string; label: string };
  credentials: string;
  npi: string;
  license: ProviderLicense;
  supervisor?: string;
  agencyStartDate: string;
  contact: ProfileContact;
  agency: ProviderAgency;
}

export interface ProfileState {
  profile: ProviderProfile;
}

export interface SettingsSummary {
  notifications: { enabled: number; total: number };
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface TimeSlot {
  /** `HH:mm` */
  start: string;
  /** `HH:mm` */
  end: string;
}

export interface AvailabilityRange {
  id: string;
  /** `YYYY-MM-DD` */
  startDate: string;
  /** `YYYY-MM-DD`; missing when the range has no end. */
  endDate?: string;
  /** An empty list means not available that day. */
  days: Record<Weekday, TimeSlot[]>;
}

export interface AvailabilityState {
  ranges: AvailabilityRange[];
}

export type AppearancePreference = 'system' | 'light' | 'dark';

export interface PreferencesState {
  appearance: AppearancePreference;
  biometricUnlock: boolean;
}

export interface BlockedDay {
  id: string;
  title: string;
  /** `YYYY-MM-DD` */
  startDate: string;
  /** `YYYY-MM-DD` */
  endDate: string;
  /** `HH:mm`; missing for an all-day block. */
  hours?: { start: string; end: string };
  notifyOffice: boolean;
}

export interface BlockDaysState {
  blockedDays: BlockedDay[];
}
