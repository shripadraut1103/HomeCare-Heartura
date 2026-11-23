export interface ApiAvailabilityProvider {
  id: string;
  name: string;
  discipline: string;
  role_type: string;
  status: string;
  supervisor_name: string;
}

export interface ApiWindow {
  start_time: string;
  end_time: string;
}

export interface ApiDay {
  weekday: number;
  windows: ApiWindow[];
}

export interface ApiRange {
  effective_from: string;
  effective_to: string;
  days: ApiDay[];
}

export interface ApiWeeklyHours {
  provider: string;
  provider_name: string;
  version: number;
  updated_at: string | null;
  updated_by_name: string;
  ranges: ApiRange[];
}

export interface ApiWeeklyHoursUpdate {
  version: number;
  ranges: ApiRange[];
}

export interface ApiBlockDay {
  id: string;
  provider: string;
  provider_name: string;
  title: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  notify_office: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ApiBlockDayWrite {
  provider: string;
  title: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  notify_office: boolean;
}
