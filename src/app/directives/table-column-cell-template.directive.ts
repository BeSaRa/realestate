import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[appTableColumnCellTemplate]',
  standalone: true,
})
export class TableColumnCellTemplateDirective {
  templateRef = inject(TemplateRef);
}
