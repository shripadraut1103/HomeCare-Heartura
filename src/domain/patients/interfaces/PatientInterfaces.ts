export interface IndividualServicePlan {
  patientId: string;
  signedOn: string;
  sections: readonly IspSection[];
}

export interface IspSection {
  title: string;
  lines: readonly string[];
}

export interface Patient {
  id: string;
  name: string;
  tag: string;
  dateOfBirth: string;
  discipline: string;
  isNew?: boolean;
  serviceLocation: string;
  payers: readonly string[];
  address: string;
  phone: string;
  guardian?: string;
  units: { usedThisWeek: number; authorizedPerWeek: number; remainingInclMakeup: number };
}
