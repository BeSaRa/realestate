import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';

@Component({
  selector: 'app-owner-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderComponent],
  templateUrl: './ownership-indicators-page.component.html',
  styleUrls: ['./ownership-indicators-page.component.scss'],
})
export default class OwnershipIndicatorsPageComponent {
  lang = inject(TranslationService);
}
