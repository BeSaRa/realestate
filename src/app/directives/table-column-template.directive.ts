import { Directive, Input, TemplateRef, inject } from '@angular/core';
import { objectHasOwnProperty } from '@utils/utils';

@Directive({
  selector: '[appTableColumnTemplate]',
  standalone: true,
})
export class TableColumnTemplateDirective {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ required: true }) columnName!: string;
  @Input({ required: true }) columnHeader!: string;
  @Input() bindColumnValue?: string | ((item: any) => any);

  templateRef = inject(TemplateRef);

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
