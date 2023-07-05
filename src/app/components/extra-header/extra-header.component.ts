import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-extra-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extra-header.component.html',
  styleUrls: ['./extra-header.component.scss'],
})
export class ExtraHeaderComponent {
  lang = inject(TranslationService);
}
