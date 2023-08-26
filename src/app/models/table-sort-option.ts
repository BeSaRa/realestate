import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';

export class TableSortOption extends ClonerMixin(GetNamesMixin(class {})) {
  value!: {
    column: string;
    direction: 'asc' | 'desc';
  };
}
