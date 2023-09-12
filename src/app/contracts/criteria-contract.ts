export interface CriteriaContract {
  areaCode: number;
  propertyTypeList: number[];
  municipalityId: number;
  purposeList: number[];
  issueDateQuarterList: number[];
  issueDateYear: number;
  issueDateStartMonth: number;
  issueDateEndMonth: number;
  issueDateFrom: string;
  issueDateTo: string;
  areaFrom: number;
  areaTo: number;
  streetNo: number;
  zoneId: number;

  // not related to model
  halfYearDuration: number;
}
