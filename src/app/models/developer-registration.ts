import { ClonerMixin } from '@mixins/cloner-mixin';

export class DeveloperRegistration extends ClonerMixin(class {}) {
  id!: number;
  companyName!: string;
  address!: string;
  licenseNo!: string;
  licenseDate!: string;
  recordNo!: string;
  establishmentNo!: string;
  establishmentExpirationDate!: string;
  shareCapital!: number;
  employeesNo!: number;
  engineersNo!: number;
  workersNo!: number;

  ch_name!: string;
  ch_email!: string;
  ch_phone!: string;
  ce_name!: string;
  ce_email!: string;
  ce_phone!: string;
  re_name!: string;
  re_email!: string;
  re_phone!: string;

  implementedProjects!: number;
  currentProjects!: number;
  futureProjects!: number;
  hasOffPlanProjects!: boolean;
  implementedOffPlan!: number;
  currentOffPlan!: number;
  currentOffPlanData!: CurrentOffPlanData[];
  futureOffPlan!: number;

  soldVillasNo!: number;
  soldApartmentsNo!: number;
  soldCommercialNo!: number;
  otherNo!: number;

  hasProjectsOutsideQatar!: boolean;
  outside_projects!: OutsideProjects[];

  landsNo!: number;
  mortgagedLandsNo!: number;
  lands!: LandDetails[];
}

export class CurrentOffPlanData extends ClonerMixin(class {}) {
  id!: number;
  projectName!: string;
  buildingLicenseNo!: number;
  projectStartDate!: string;
  projectExpectedEndDate!: string;
  projectCompletionPercentage!: number;
  registration_id!: number;
}

export class OutsideProjects extends ClonerMixin(class {}) {
  id!: number;
  country!: string;
  implementedProjects!: number;
  currentProjects!: number;
  futureProjects!: number;
  implementedOffPlan!: number;
  currentOffPlan!: number;
  futureOffPlan!: number;
  registration_id!: number;
}

export class LandDetails extends ClonerMixin(class {}) {
  id!: number;
  titleDeedNo!: string;
  cadastralNo!: string;
  isMortgaged!: boolean;
  registration_id!: number;
}
