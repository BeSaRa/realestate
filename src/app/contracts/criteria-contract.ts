export interface CriteriaContract {
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
  zoneId: number;
  bedRoomsCount: number;

  // not related to model
  halfYearDuration: number;
}
