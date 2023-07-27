export interface RentCriteriaContract {
  propertyTypeList: number[];
  municipalityId: number;
  rentPurposeList: number[];
  issueDateQuarterList: number[];
  bedRoomsCount: number;
  issueDateYear: number;
  issueDateStartMonth: number;
  issueDateEndMonth: number;
  issueDateFrom: string;
  issueDateTo: string;
  rentPaymentMonthlyPerUnitFrom: number;
  rentPaymentMonthlyPerUnitTo: number;
  areaFrom: number;
  areaTo: number;
  baseYear: string;
  zoneId: number;
  streetNo: number;
}
