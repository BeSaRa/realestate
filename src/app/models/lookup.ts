import { GetNamesMixin } from '@mixins/get-names-mixin';

export class Lookup extends GetNamesMixin(class {}) {
  lookupKey!: number;
  isActive!: boolean;
  municipalityId!: number;
}
