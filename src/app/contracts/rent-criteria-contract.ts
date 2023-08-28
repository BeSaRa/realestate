import { CriteriaContract } from './criteria-contract';

export interface RentCriteriaContract extends CriteriaContract {
  rentPaymentMonthlyPerUnitFrom: number;
  rentPaymentMonthlyPerUnitTo: number;
  bedRoomsCount: number;
  furnitureStatus: number;
  baseYear: string;
  streetNo: number;
}
