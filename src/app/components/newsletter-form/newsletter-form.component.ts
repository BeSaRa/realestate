import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [CommonModule, IconButtonComponent, InputSuffixDirective, InputComponent],
  templateUrl: './newsletter-form.component.html',
  styleUrls: ['./newsletter-form.component.scss'],
})
export class NewsletterFormComponent {
  lang = inject(TranslationService);
}
