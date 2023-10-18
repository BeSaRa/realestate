
import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';
export class MenuItem extends ClonerMixin(GetNamesMixin(class {})) {
  status!: boolean;
  url!: string;
  clicks!: string;
  menu_id!:number;
  is_authenticated!: boolean;
}