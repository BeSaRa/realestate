import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Page } from '@models/page';
import { SafeHtmlPipe } from '@pipes/safe-html.pipe';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export default class PageComponent {
  @Input() pageData!: Page;

  lang = inject(TranslationService);

  getPageContent() {
    return this.pageData.translations[this.lang.getCurrent().code.includes('ar') ? 0 : 1];
  }
}
