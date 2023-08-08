import { CriteriaContract } from './criteria-contract';

export interface RentCriteriaContract extends CriteriaContract {
  bedRoomsCount: number;
  rentPaymentMonthlyPerUnitFrom: number;
  rentPaymentMonthlyPerUnitTo: number;
  baseYear: string;
  streetNo: number;
}
