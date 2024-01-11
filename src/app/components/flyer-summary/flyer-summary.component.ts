import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-flyer-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flyer-summary.component.html',
  styleUrls: ['./flyer-summary.component.scss'],
})
export class FlyerSummaryComponent {
  @Input() indicatorType: 'sell' | 'rent' | 'mort' = 'sell';
  @Input() isOpened = false;

  lang = inject(TranslationService);

  private _titles = {
    sell: this.lang.map.sell,
    rent: this.lang.map.rent,
    mort: this.lang.map.mortgage,
  };

  getTitle() {
    return this._titles[this.indicatorType];
  }
}
