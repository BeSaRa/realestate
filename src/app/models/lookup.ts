import { GetNamesMixin } from '@mixins/get-names-mixin';
import { ClonerMixin } from '@mixins/cloner-mixin';

export class Lookup extends ClonerMixin(GetNamesMixin(class {})) {
  id!: number;
  lookupKey!: number;
  isActive!: boolean;
  municipalityId!: number;

  // not related to model
  disabled = false;
}
