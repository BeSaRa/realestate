import { Directive, inject } from '@angular/core';
import { TranslationService } from '@services/translation.service';

@Directive({
  selector: '[appBaseBotAction]',
  standalone: true,
})
export class BaseBotActionDirective {
  lang = inject(TranslationService);
}
