import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { DashboardService } from '@services/dashboard.service';
import { TranslationService } from '@services/translation.service';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-price-range',
  standalone: true,
  imports: [CommonModule, CustomTooltipDirective],
  templateUrl: './price-range.component.html',
  styleUrls: ['./price-range.component.scss'],
})
export class PriceRangeComponent implements OnChanges {
  @Input({ required: true }) dataUrl!: string;
  @Input({ required: true }) criteria!: FlyerCriteriaContract;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);

  prices = [5, 10, 15, 20, 25, 30];
  pricesMap: Record<string, number> = { '0': 0, '5': 0, '10': 0, '15': 0, '20': 0, '25': 0, '30': 0 };
  pricesKeys = ['0', '5', '10', '15', '20', '25', '30', '35'];
  totalCount = 1;

  isLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['dataUrl'] && changes['dataUrl'].currentValue !== changes['dataUrl'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.dataUrl || !this.criteria) return;
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;

    this.dashboardService
      .loadFlyerPriceRangeData(this.dataUrl, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((data) => {
        data.forEach((item) => {
          if (item.range.indexOf('to') > 0) {
            this.pricesMap[item.range.slice(0, item.range.indexOf('to') - 1)] = item.kpiValCount;
          } else {
            this.pricesMap['30'] = item.kpiValCount;
          }
          this.totalCount += item.kpiValCount;
        });
      });
  }

  getX(value: number) {
    return 110 - (value / this.prices[this.prices.length - 1]) * 90;
  }

  getCountX(index: number) {
    if (index === 0) return this.getX(this.prices[0]) + (this.getX(this.prices[0]) - this.getX(this.prices[1])) / 2;
    if (index === this.prices.length)
      return (
        this.getX(this.prices[this.prices.length - 1]) - (this.getX(this.prices[0]) - this.getX(this.prices[1])) / 2
      );
    return (this.getX(this.prices[index]) + this.getX(this.prices[index - 1])) / 2;
  }

  getTooltipTitle(key: string) {
    if (key === '0') {
      return this.lang.map.less_than + ' 5 ' + this.lang.map.million;
    }
    if (key === '30') {
      return this.lang.map.more_than + ' 30 ' + this.lang.map.million;
    }
    return (
      this.lang.map.from +
      ' ' +
      key +
      ' ' +
      this.lang.map.to +
      ' ' +
      (Number.parseInt(key) + 5).toString() +
      ' ' +
      this.lang.map.million
    );
  }
}
