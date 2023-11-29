import { TableColumn } from '@models/table-column';
import { SectionType } from '@enums/section-type';
import { SecurityType } from '@enums/security-type';
import { ClonerMixin } from '@mixins/cloner-mixin';

export class Section extends ClonerMixin(class {}) {
  id!: number;
  page_id!: number;
  type!: SectionType;
  security!: SecurityType;
  code!: string;
  hide!: boolean;
  roles!: string[];
  users!: string[];
  columns!: Record<string, TableColumn>;

  // todo list
  // section

  // isTable()
  // isKPI()

  // abstract

  // 1 - method to check is user exists
  // 1 - method  to check is role exists
  // isHidden()
}
