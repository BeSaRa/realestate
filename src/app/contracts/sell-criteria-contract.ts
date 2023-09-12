import { CriteriaContract } from './criteria-contract';

export interface SellCriteriaContract extends CriteriaContract {
  issueDateMonth: number;
  realEstateValueFrom: number;
  realEstateValueTo: number;
}
