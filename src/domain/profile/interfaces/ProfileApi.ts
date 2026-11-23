export interface ApiProfileAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}

export interface ApiProfileSignature {
  value: string;
  saved_at: string | null;
  changes_max: number;
  changes_left: number;
}

export interface ApiMyProfile {
  id: string;
  kind: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  version: number;
  photo_url: string | null;
  signature: ApiProfileSignature | null;
  member: {
    username: string;
    role_name: string;
    role_type: string;
    discipline: string;
    job_title: string;
    supervisor_name: string;
    state_licence_number: string;
    state_licence_expiry: string | null;
    npi: string;
    medicaid_number: string;
    licence_type: string;
    organization_name: string;
    address: ApiProfileAddress | null;
  } | null;
}

export interface ApiProfileUpdate {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  version: number;
}

export interface ApiPhotoUpload {
  uri: string;
  name: string;
  type: string;
}
