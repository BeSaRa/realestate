import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LawListComponent } from '@components/law-list/law-list.component';
import { LawService } from '@services/law.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-law-page',
  standalone: true,
  imports: [CommonModule, LawListComponent],
  templateUrl: './law-page.component.html',
  styleUrls: ['./law-page.component.scss'],
})
export default class LawPageComponent {
  lawService = inject(LawService);
  lawData$ = this.lawService.load();

  lang = inject(TranslationService);
}
