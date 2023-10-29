import { ClonerMixin } from '@mixins/cloner-mixin';
import { MenuItem } from '@models/menu-item';

export class Menu extends ClonerMixin(class {}) {
  id!: number;
  key!: string;
  title!: string;
  status!: boolean;
  links!: MenuItem[];
}
