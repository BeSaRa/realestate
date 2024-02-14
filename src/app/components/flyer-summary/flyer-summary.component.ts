import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { DashboardService } from '@services/dashboard.service';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { finalize, take } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { CountUpModule } from 'ngx-countup';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';

@Component({
  selector: 'app-flyer-summary',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, CountUpModule],
  templateUrl: './flyer-summary.component.html',
  styleUrls: ['./flyer-summary.component.scss'],
})
export class FlyerSummaryComponent extends OnDestroyMixin(class {}) implements OnChanges {
  @Input() indicatorType: 'sell' | 'rent' | 'mort' = 'sell';
  @Input({ required: true }) dataUrls!: { valueUrl: string; countUrl: string };
  @Input({ required: true }) criteria!: FlyerCriteriaContract;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);

  data = { value: 0, count: 0 };
  isLoading = false;

  private _titles = {
    sell: () => this.lang.map.sell,
    rent: () => this.lang.map.rent,
    mort: () => this.lang.map.mortgage,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['dataUrls'] && changes['dataUrls'].currentValue !== changes['dataUrls'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.dataUrls || !this.criteria) return;
      this.loadData();
    }
  }

  getTitle() {
    return this._titles[this.indicatorType]();
  }

  loadData() {
    this.isLoading = true;
    if (this.criteria.issueDateMonth || this.criteria.issueDateQuarter) this.loadMonthlyOrQuarterlyData();
    else this.loadYearlyData();
  }

  loadYearlyData() {
    this.dashboardService
      .loadFlyerSummaryData(this.dataUrls, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe(([count, value]) => {
        this.data = { count: count.getKpiVal(), value: value.getKpiVal() };
      });
  }

  loadMonthlyOrQuarterlyData() {
    this.dashboardService
      .loadFlyerDurationSummaryData(this.dataUrls, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe(([count, value]) => {
        this.data = { count: count.getKpiVal(), value: value.getKpiVal() };
      });
  }
}
