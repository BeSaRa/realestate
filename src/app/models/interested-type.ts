import { GetNamesMixin } from '@mixins/get-names-mixin';

export class InterestedType extends GetNamesMixin(class {}) {
  declare code: 'INVESTOR' | 'DEVELOPER';
}
