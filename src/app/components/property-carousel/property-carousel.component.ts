import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { CriteriaContract } from '@contracts/criteria-contract';
import { Breakpoints } from '@enums/breakpoints';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { KpiBase } from '@models/kpi-base';
import { KpiPropertyType } from '@models/kpi-property-type';
import { KpiPurpose } from '@models/kpi-purpose';
import { KpiRoot } from '@models/kpi-root';
import { DashboardService } from '@services/dashboard.service';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { TranslationService } from '@services/translation.service';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel2';
import { CountUpModule } from 'ngx-countup';
import { finalize, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-property-carousel',
  standalone: true,
  imports: [CommonModule, IvyCarouselModule, CountUpModule, ChangeIndicatorComponent, MatProgressSpinnerModule],
  templateUrl: './property-carousel.component.html',
  styleUrls: ['./property-carousel.component.scss'],
})
export class PropertyCarouselComponent extends OnDestroyMixin(class {}) implements OnChanges, OnInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) properties!: KpiPropertyType[];
  @Input({ required: true }) kpiRoot!: KpiRoot;
  @Input({ required: true }) purpose!: KpiPurpose;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input() useAssetsFrom = 'rent';
  @Input() ignoreLocalImages = false;
  @Input() showYoy = true;

  @ViewChildren('carousel') carousel!: QueryList<CarouselComponent>;

  lang = inject(TranslationService);
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);
  screenService = inject(ScreenBreakpointsService);
  dashboardService = inject(DashboardService);

  isArrowOutside = true;
  isLoading = false;

  images = {
    39: 'assets/images/rental-images/department.png',
    40: 'assets/images/rental-images/villa.png',
    41: 'assets/images/rental-images/building.png',
    43: 'assets/images/rental-images/land.png',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['kpiRoot'] && changes['kpiRoot'].currentValue !== changes['kpiRoot'].previousValue) ||
      (changes['purpose'] && changes['purpose'].currentValue !== changes['purpose'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.kpiRoot || !this.criteria || !this.purpose) return;
      this.updatePropertyTypeKpis();
      this._goToFirstCell();
    }
  }

  ngOnInit(): void {
    this._listenToScreenSizeChange();
  }

  updatePropertyTypeKpis() {
    this.isLoading = true;
    this.dashboardService
      .loadPropertyTypeKpi(this.kpiRoot, {
        ...this.criteria,
        purposeList: [this.purpose.id],
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((result) => {
        this.properties.forEach((item) => item.kpiData.resetAllValues());

        this.properties = this.properties
          .map((item) => {
            const _propertyTypeKpiData = result.find((i) => i.propertyTypeId === item.id);
            _propertyTypeKpiData && (item.kpiData = _propertyTypeKpiData);
            return item;
          })
          .sort((a, b) => a.kpiData.getKpiVal() - b.kpiData.getKpiVal());
        this.updateAllPropertyType();
      });
  }

  updateAllPropertyType(): void {
    const _propertyType = this.properties.find((i) => i.id === -1);
    _propertyType && (_propertyType.kpiData = KpiBase.kpiFactory(this.kpiRoot.hasSqUnit).clone(this.purpose.kpiData));
  }

  getItemImage(item: KpiPropertyType) {
    return !this.ignoreLocalImages
      ? Object.prototype.hasOwnProperty.call(this.images, item.id)
        ? this.images[item.id as keyof typeof this.images]
        : this.images[41]
      : `assets/icons/${this.useAssetsFrom}/${item.id}.png`;
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
