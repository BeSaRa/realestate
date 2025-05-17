import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableAction]',
})
export class TableActionDirective {
  templateRef = inject(TemplateRef);
}
