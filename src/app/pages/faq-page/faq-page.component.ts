import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { FaqService } from '@services/faq.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [CommonModule, MatExpansionModule],
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.scss'],
})
export default class FaqPageComponent {
  faqService = inject(FaqService);
  faqData$ = this.faqService.load();

  lang = inject(TranslationService);
}
