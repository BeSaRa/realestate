import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { Law } from '@models/law';
import { TranslationService } from '@services/translation.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { SafeHtmlPipe } from '@pipes/safe-html.pipe';

@Component({
  selector: 'app-law-details-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderComponent, MatExpansionModule, SafeHtmlPipe],
  templateUrl: './law-details-page.component.html',
  styleUrls: ['./law-details-page.component.scss'],
})
export default class LawDetailsPageComponent {
  @Input() lawData!: Law;

  lang = inject(TranslationService);
}
