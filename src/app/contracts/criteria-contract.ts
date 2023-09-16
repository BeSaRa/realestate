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
  nationalityCode: number;
  areaFrom: number;
  areaTo: number;
  streetNo: number;
  zoneId: number;
  offset?: number;
  limit?: number;
  // not related to model
  halfYearDuration: number;
}
