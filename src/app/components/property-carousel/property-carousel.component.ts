import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, QueryList, ViewChildren, inject } from '@angular/core';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { Breakpoints } from '@enums/breakpoints';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Lookup } from '@models/lookup';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { TranslationService } from '@services/translation.service';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel2';
import { CountUpModule } from 'ngx-countup';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-property-carousel',
  standalone: true,
  imports: [CommonModule, IvyCarouselModule, CountUpModule, ChangeIndicatorComponent],
  templateUrl: './property-carousel.component.html',
  styleUrls: ['./property-carousel.component.scss'],
})
export class PropertyCarouselComponent extends OnDestroyMixin(class {}) implements OnChanges {
  @Input({ required: true }) properties!: Lookup[];
  @Input() useAssetsFrom = 'rent';
  @Input() ignoreLocalImages = false;
  @Input() showYoy = true;

  @ViewChildren('carousel') carousel!: QueryList<CarouselComponent>;

  lang = inject(TranslationService);
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);
  screenService = inject(ScreenBreakpointsService);

  isArrowOutside = true;

  images = {
    39: 'assets/images/rental-images/department.png',
    40: 'assets/images/rental-images/villa.png',
    41: 'assets/images/rental-images/building.png',
    43: 'assets/images/rental-images/land.png',
  };

  ngOnChanges(): void {
    this._goToFirstCell();
    this._listenToScreenSizeChange();
  }

  getItemImage(item: Lookup) {
    return !this.ignoreLocalImages
      ? Object.prototype.hasOwnProperty.call(this.images, item.lookupKey)
        ? this.images[item.lookupKey as keyof typeof this.images]
        : this.images[41]
      : `assets/icons/${this.useAssetsFrom}/${item.lookupKey !== -1 ? item.lookupKey : 43}.png`;
  }

  private _goToFirstCell(): void {
    if (!this.carousel?.length) return;
    this.carousel.first.cellsToScroll = this.carousel.first.cellLength;
    this.carousel.first.next();
    this.carousel.first.cellsToScroll = 1;
  }

  private _listenToScreenSizeChange() {
    this.screenService.screenSizeObserver$.pipe(takeUntil(this.destroy$)).subscribe((size) => {
      if (size === Breakpoints.XS) {
        this.isArrowOutside = false;
      } else {
        this.isArrowOutside = true;
      }
    });
  }
}
