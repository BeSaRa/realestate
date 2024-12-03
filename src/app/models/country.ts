import { GetNamesMixin } from '@mixins/get-names-mixin';

export class Country extends GetNamesMixin(class {}) {
  declare id: number;
  declare phoneCode: string;
  declare alpha2Code: string;
  declare alpha3Code: string;
}
