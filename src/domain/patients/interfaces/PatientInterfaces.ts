export interface IndividualServicePlan {
  patientId: string;
  signedOn: string;
  sections: readonly IspSection[];
}

export interface IspSection {
  title: string;
  lines: readonly string[];
}
