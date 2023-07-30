import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-sell-indicators-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderComponent],
  templateUrl: './sell-indicators-page.component.html',
  styleUrls: ['./sell-indicators-page.component.scss'],
})
export default class SellIndicatorsPageComponent {
  lang = inject(TranslationService);
}
