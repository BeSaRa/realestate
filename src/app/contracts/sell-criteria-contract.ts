import { CriteriaContract } from './criteria-contract';

export interface SellCriteriaContract extends CriteriaContract {
  areaCode: number;
  issueDateMonth: number;
  realEstateValueFrom: number;
  realEstateValueTo: number;
}
