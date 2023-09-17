import { CriteriaContract } from './criteria-contract';

export interface OwnerCriteriaContract extends CriteriaContract {
  genderCode: number;
  ownerCategoryCode: number;
}
