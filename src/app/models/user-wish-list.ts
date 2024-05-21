import { CriteriaContract } from '@contracts/criteria-contract';
import { ClonerMixin } from '@mixins/cloner-mixin';

class UserWishListBase extends ClonerMixin(class {}) {
  id!: number;
  userId!: string;
  pageName = '';
  name = '';
  creationTime = '';
  lastModifiedTime = '';
}

export class UserWishListResponse extends UserWishListBase {
  criteria = '';
}

export class UserWishList extends UserWishListBase {
  criteria!: CriteriaContract;
}

export enum OperationType {
  EDIT = 'edit',
  NEW = 'new',
}
