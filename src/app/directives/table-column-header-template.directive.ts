import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: 'ng-template[appTableColumnHeaderTemplate]',
  standalone: true,
})
export class TableColumnHeaderTemplateDirective {
  templateRef = inject(TemplateRef);
}
