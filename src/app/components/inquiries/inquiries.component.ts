import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { ScreenBreakpoints } from '@constants/screen-breakpoints';
import { ElementReferenceDirective } from '@directives/element-reference.directive';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-inquiries',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ElementReferenceDirective,
    InputComponent,
    InputSuffixDirective,
    IconButtonComponent,
  ],
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.scss'],
})
export class InquiriesComponent {
  search = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d+$/)] });

  lang = inject(TranslationService);
  breakpointObserverService = inject(BreakpointObserver);

  onSearch() {
    if (this.search.valid)
      window.open('https://geoportal.gisqatar.org.qa/searchpin/?pin=' + this.search.value, '_blank');
  }

  isScreenSM() {
    return this.breakpointObserverService.isMatched(ScreenBreakpoints.xs);
  }
}
