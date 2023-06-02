import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appElementReference]',
  exportAs: 'appElementReference',
  standalone: true,
})
export class ElementReferenceDirective {
  elementReference = inject(ElementRef).nativeElement;
}
