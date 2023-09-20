import { GetNamesMixin } from '@mixins/get-names-mixin';
import { ClonerMixin } from '@mixins/cloner-mixin';

export class Lookup extends ClonerMixin(GetNamesMixin(class {})) {
  lookupKey!: number;
  isActive!: boolean;
  municipalityId!: number;
  disabled!: boolean;
  // for max params
  fieldName!: string;
  minVal!: number;
  maxVal!: number;
  id!: number;
  // not related to the model
  value = 0;
  yoy = 0;
  selected = false;
  url = '';
  hasPrice = false;
}
