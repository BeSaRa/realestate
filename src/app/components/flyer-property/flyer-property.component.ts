import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FlyerProperty } from '@models/flyer-property';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { formatNumberWithSuffix } from '@utils/utils';

@Component({
  selector: 'app-flyer-property',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flyer-property.component.html',
  styleUrls: ['./flyer-property.component.scss'],
})
export class FlyerPropertyComponent {
  @Input({ required: true }) item!: FlyerProperty;
  @Input() useAssetsFrom: 'rent' | 'sell' = 'rent';
  @Input() ignoreLocalImages = true;

  lang = inject(TranslationService);
  lookupService = inject(LookupService);

  images = {
    39: 'assets/images/rental-images/department.png',
    40: 'assets/images/rental-images/villa.png',
    41: 'assets/images/rental-images/building.png',
    43: 'assets/images/rental-images/land.png',
  };

  getNames() {
    return (
      this.useAssetsFrom === 'sell'
        ? this.lookupService.sellPropertyTypeMap[this.item.propertyTypeId]
        : this.lookupService.rentPropertyTypeMap[this.item.propertyTypeId]
    ).getNames();
  }

  getIconUrl() {
    return !this.ignoreLocalImages
      ? Object.prototype.hasOwnProperty.call(this.images, this.item.propertyTypeId)
        ? this.images[this.item.propertyTypeId as keyof typeof this.images]
        : this.images[41]
      : `assets/icons/${this.useAssetsFrom}/${this.item.propertyTypeId}.png`;
  }

  getCount() {
    return this.item.kpiCount ?? '---';
  }

  getAvgValue() {
    if (!this.item.kpiValAvg) return '---';
    const _value = formatNumberWithSuffix(this.item.kpiValAvg);
    return _value.num + ' ' + (this.lang.isLtr ? _value.enSuffix : _value.arSuffix);
  }

  getTotalValue() {
    if (!this.item.kpiVal) return '---';
    const _value = formatNumberWithSuffix(this.item.kpiVal);
    return _value.num + ' ' + (this.lang.isLtr ? _value.enSuffix : _value.arSuffix);
  }

  getPercent() {
    return this.item.yoyDifference ?? this.item.qoqDifference ?? this.item.momDifference ?? 0;
  }
}
