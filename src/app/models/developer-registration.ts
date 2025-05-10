import { ClonerMixin } from '@mixins/cloner-mixin';
import { Attachment } from './attachment';

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
  futureProjects!: number;
  hasOffPlanProjects!: boolean;

  hasCurrentProjects!: boolean;
  currentProjects!: number;
  currentProjectData!: CurrentProjectData[];

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

export class CurrentProjectData extends ClonerMixin(class {}) {
  id!: number;
  projectName!: string;
  licenseAttachments: string[] = [];
  licensePlansAttachments: string[] = [];
  unitsAttachments: string[] = [];
  technicalReportAttachments: string[] = [];
  financialReportAttachments: string[] = [];
  warrantyAgreementAttachments: string[] = [];
  saleContractsAttachments: string[] = [];
  sampleSaleContractsAttachments: string[] = [];
}

export class CurrentOffPlanData extends ClonerMixin(class {}) {
  id!: number;
  projectName!: string;
  buildingLicenseNo!: number;
  projectStartDate!: string;
  projectExpectedEndDate!: string;
  projectCompletionPercentage!: number;
  villasNo!: number;
  apartmentsNo!: number;
  commercialNo!: number;
  otherNo!: number;
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

export class CurrentProjectAttachments extends ClonerMixin(class {}) {
  license: Attachment[] = [];
  licensePlans: Attachment[] = [];
  units: Attachment[] = [];
  technicalReport: Attachment[] = [];
  financialReport: Attachment[] = [];
  warrantyAgreement: Attachment[] = [];
  saleContracts: Attachment[] = [];
  sampleSaleContracts: Attachment[] = [];
}
