import { BaseSectionGuard } from '@abstracts/base-section-guard';
import { SectionType } from '@enums/section-type';
import { ColumnGuard } from '@models/column-guard';

export class SectionGuard extends BaseSectionGuard {
  code!: string;
  page_id!: number;
  type!: SectionType;

  columns!: Record<string, ColumnGuard>;

  isColumnHidden(columnName: string) {
    return this.columns[columnName] ? this.columns[columnName].isHidden() : false;
  }
}
