import { GetNamesMixin } from '@mixins/get-names-mixin';
import { ClonerMixin } from '@mixins/cloner-mixin';

export class Lookup extends ClonerMixin(GetNamesMixin(class {})) {
  lookupKey!: number;
  isActive!: boolean;
  municipalityId!: number;
  disabled!: boolean;
  // not related to the model
  value = 565;
  yoy = 2;
}
