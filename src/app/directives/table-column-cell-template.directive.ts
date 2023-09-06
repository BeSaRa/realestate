import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: 'ng-template[appTableColumnCellTemplate]',
  standalone: true,
})
export class TableColumnCellTemplateDirective {
  templateRef = inject(TemplateRef);
}
