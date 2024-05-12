import { CriteriaContract } from '@contracts/criteria-contract';
import { ClonerMixin } from '@mixins/cloner-mixin';

class UserWishListBase extends ClonerMixin(class {}) {
  id!: number;
  userId!: string;
  criteriaKPIRoute = '';
  parentCriteria = '';
  parentCriteriaKPIRoute = '';
  grandParentCriteria = '';
  grandParentCriteriaKPIRoute = '';
  pageName = '';
  pageDescription = '';
  creationTime = '';
  lastModifiedTime = '';
}

export class UserWishListResponse extends UserWishListBase {
  criteria = '';
}

export class UserWishList extends UserWishListBase {
  criteria!: CriteriaContract;
}

export class UserWishListApplyResponse extends ClonerMixin(class {}) {
  criteriaResponse!: CriteriaContract;
  parentCriteriaResponse!: CriteriaContract;
  grandParentCriteriaResponse!: CriteriaContract;
}

export enum OperationType {
  EDIT = 'edit',
  NEW = 'new',
}
