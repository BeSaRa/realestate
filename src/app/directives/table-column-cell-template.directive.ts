import { Directive, Input, TemplateRef, Type, inject } from '@angular/core';

interface Context<T> {
  $implicit: T;
}

@Directive({
  selector: 'ng-template[appTableColumnCellTemplate]',
  standalone: true,
})
export class TableColumnCellTemplateDirective<T extends object> {
  @Input() appTableColumnCellTemplateDataType!: Type<T>;

  templateRef = inject(TemplateRef<Context<T>>);

  static ngTemplateContextGuard<TContext extends object>(
    directive: TableColumnCellTemplateDirective<TContext>,
    context: unknown
  ): context is Context<TContext> {
    return true;
  }
}
