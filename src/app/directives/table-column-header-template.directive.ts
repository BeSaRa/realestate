import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[appTableColumnHeaderTemplate]',
  standalone: true,
})
export class TableColumnHeaderTemplateDirective {
  templateRef = inject(TemplateRef);
}
