import { ContentChild, Directive, Input } from '@angular/core';
import { objectHasOwnProperty } from '@utils/utils';
import { TableColumnCellTemplateDirective } from './table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from './table-column-header-template.directive';

@Directive({
  selector: '[appTableColumnTemplate]',
  standalone: true,
})
export class TableColumnTemplateDirective {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ required: true }) columnName!: string;
  @Input() bindColumnValue?: string | ((item: any) => any);

  @ContentChild(TableColumnHeaderTemplateDirective) header!: TableColumnHeaderTemplateDirective;
  @ContentChild(TableColumnCellTemplateDirective) cell!: TableColumnCellTemplateDirective<object>;

  getBindValue(columnData: unknown): unknown {
    return this.bindColumnValue && typeof this.bindColumnValue === 'string'
      ? typeof (columnData as never)[this.bindColumnValue] === 'function'
        ? ((columnData as never)[this.bindColumnValue] as () => unknown)()
        : objectHasOwnProperty(columnData, this.bindColumnValue)
        ? columnData[this.bindColumnValue]
        : columnData
      : this.bindColumnValue && typeof this.bindColumnValue === 'function'
      ? this.bindColumnValue(columnData)
      : columnData;
  }
}
