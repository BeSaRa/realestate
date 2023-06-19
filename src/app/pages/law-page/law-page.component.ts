import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { LawListComponent } from '@components/law-list/law-list.component';
import { LawService } from '@services/law.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-law-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ExtraHeaderComponent, LawListComponent],
  templateUrl: './law-page.component.html',
  styleUrls: ['./law-page.component.scss'],
})
export default class LawPageComponent {
  lawService = inject(LawService);
  lawData$ = this.lawService.load();

  lang = inject(TranslationService);
}
