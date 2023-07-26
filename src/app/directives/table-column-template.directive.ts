import { Directive, Input, TemplateRef, inject } from '@angular/core';
import { objectHasOwnProperty } from '@utils/utils';

@Directive({
  selector: '[appTableColumnTemplate]',
  standalone: true,
})
export class TableColumnTemplateDirective {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ required: true }) columnName!: string;
  @Input() bindColumnValue?: string | ((item: any) => any);

  templateRef = inject(TemplateRef);

  getBindValue(rowData: unknown): unknown {
    return this.bindColumnValue && typeof this.bindColumnValue === 'string'
      ? typeof (rowData as never)[this.bindColumnValue] === 'function'
        ? ((rowData as never)[this.bindColumnValue] as () => unknown)()
        : objectHasOwnProperty(rowData, this.bindColumnValue)
        ? rowData[this.bindColumnValue]
        : rowData
      : this.bindColumnValue && typeof this.bindColumnValue === 'function'
      ? this.bindColumnValue(rowData)
      : rowData;
  }
}
