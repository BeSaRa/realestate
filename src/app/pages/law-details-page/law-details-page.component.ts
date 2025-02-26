import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { ButtonComponent } from '@components/button/button.component';
import { Law } from '@models/law';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-law-details-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatExpansionModule],
  templateUrl: './law-details-page.component.html',
  styleUrls: ['./law-details-page.component.scss'],
})
export default class LawDetailsPageComponent {
  @Input() lawData!: Law;

  lang = inject(TranslationService);

  onDownload() {
    window.open(this.lawData.fileUrl, '_blank');
  }
}
