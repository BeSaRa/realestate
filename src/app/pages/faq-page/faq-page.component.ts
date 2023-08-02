import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { FaqService } from '@services/faq.service';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderComponent, MatExpansionModule],
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.scss'],
})
export default class FaqPageComponent {
  faqService = inject(FaqService);
  faqData$ = this.faqService.load();

  lang = inject(TranslationService);
}
