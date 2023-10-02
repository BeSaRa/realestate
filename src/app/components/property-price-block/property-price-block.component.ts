import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { CountUpModule } from 'ngx-countup';
import { MLPriceItem } from '@models/ml-price-item';

@Component({
  selector: 'app-property-price-block',
  standalone: true,
  imports: [CommonModule, ChangeIndicatorComponent, CountUpModule],
  templateUrl: './property-price-block.component.html',
  styleUrls: ['./property-price-block.component.scss'],
})
export class PropertyPriceBlockComponent {
  lang = inject(TranslationService);
  @Input()
  item?: MLPriceItem;
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);
  
  @Input()
  ignoreLocalImages = false;

  images = {
    39: 'assets/images/rental-images/department.png',
    40: 'assets/images/rental-images/villa.png',
    41: 'assets/images/rental-images/building.png',
    43: 'assets/images/rental-images/land.png',
  };

  getItemImage(item: MLPriceItem | undefined) {
    if (!item) return;
    return !this.ignoreLocalImages
      ? Object.prototype.hasOwnProperty.call(this.images, item?.propertyTypeId)
        ? this.images[item?.propertyTypeId as keyof typeof this.images]
        : this.images[41]
      : `assets/icons/sell/${item?.propertyTypeId}.png`;
  }
}
