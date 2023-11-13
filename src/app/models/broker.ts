import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';

export class Broker extends ClonerMixin(GetNamesMixin(class {})) {
  id!: number;
  phone!: string;
  email!: string;
  municipalityId!: number;
}
