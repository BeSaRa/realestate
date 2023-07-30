import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { Lookup } from '@models/lookup';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { CountUpModule } from 'ngx-countup';

@Component({
  selector: 'app-property-block',
  standalone: true,
  imports: [CommonModule, ChangeIndicatorComponent, CountUpModule],
  templateUrl: './property-block.component.html',
  styleUrls: ['./property-block.component.scss'],
})
export class PropertyBlockComponent {
  isHovered = false;
  lang = inject(TranslationService);
  @Input()
  item!: Lookup;
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);

  images = {
    39: 'assets/images/rental-images/department.png',
    40: 'assets/images/rental-images/villa.png',
    41: 'assets/images/rental-images/building.png',
    43: 'assets/images/rental-images/land.png',
  };

  getItemImage(item: Lookup) {
    return Object.prototype.hasOwnProperty.call(this.images, item.lookupKey)
      ? this.images[item.lookupKey as keyof typeof this.images]
      : this.images[41];
  }
}
