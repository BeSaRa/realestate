import { CriteriaContract } from './criteria-contract';

export interface OwnerCriteriaContract extends CriteriaContract {
  nationalityCode: number;
  genderCode: number;
}
