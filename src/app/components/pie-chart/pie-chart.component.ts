import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, QueryList, ViewChildren, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PieChartOptions } from '@app-types/pie-chart-options';
import { CriteriaContract } from '@contracts/criteria-contract';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartConfig } from '@models/chart-options-model';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { TranslationService } from '@services/translation.service';
import { objectHasOwnProperty } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { Observable, combineLatest, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatProgressSpinnerModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent extends OnDestroyMixin(class {}) implements AfterViewInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) filterCriteria$!: Observable<CriteriaContract | undefined>;
  @Input({ required: true }) rootData$!: Observable<
    { chartDataUrl: string; hasPrice: boolean; makeUpdate?: boolean } | undefined
  >;
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input() bindValue: string | ((item: any) => number) = 'kpiVal';
  @Input() valueUnit?: string;

  @ViewChildren('pieChart') pieChart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  appChartTypesService = inject(AppChartTypesService);
  dashboardService = inject(DashboardService);

  criteria!: CriteriaContract;
  rootData!: { chartDataUrl: string; hasPrice: boolean };

  isLoading = false;

  pieChartOptions: PieChartOptions = {
    ...this.appChartTypesService.pieChartOptions,
    tooltip: {
      custom: (opts) => this._getPieCustomTooltip(opts),
    },
  };

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._listenToCriteriaAndRootChange();
    }, 0);
  }

  private _listenToCriteriaAndRootChange() {
    combineLatest([this.filterCriteria$, this.rootData$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([criteria, root]) => {
        if (!criteria || !root) return;
        this.criteria = criteria;
        if (this.rootData !== root && root.makeUpdate === false) {
          this.rootData = root;
          return;
        }
        this.rootData = root;
        this._updatePieChartData();
      });
  }

  private _updatePieChartData() {
    this.isLoading = true;
    this.dashboardService
      .loadChartKpiData(this.rootData, this.criteria)
      .pipe(take(1))
      .subscribe((data) => {
        data.sort((a, b) => b.kpiVal - a.kpiVal);

        this.isLoading = false;
        this.pieChart.first
          ?.updateOptions({
            series: data.map((item) => this._getValue(item)),
            labels: data.map((item) => this._getLabel(item)),
          })
          .then();
      });
  }

  private _getValue(item: unknown): number {
    return this.bindValue && typeof this.bindValue === 'string'
      ? typeof (item as never)[this.bindValue] === 'function'
        ? ((item as never)[this.bindValue] as () => number)()
        : objectHasOwnProperty(item, this.bindValue)
        ? (item[this.bindValue] as number)
        : (item as unknown as number)
      : this.bindValue && typeof this.bindValue === 'function'
      ? (this.bindValue(item) as number)
      : (item as unknown as number);
  }

  private _getLabel(item: unknown): string {
    return this.bindLabel && typeof this.bindLabel === 'string'
      ? typeof (item as never)[this.bindLabel] === 'function'
        ? ((item as never)[this.bindLabel] as () => string)()
        : objectHasOwnProperty(item, this.bindLabel)
        ? (item[this.bindLabel] as string)
        : (item as unknown as string)
      : this.bindLabel && typeof this.bindLabel === 'function'
      ? (this.bindLabel(item) as string)
      : (item as unknown as string);
  }

  private _getPieCustomTooltip = (opts: { seriesIndex: number; series: number[]; w: ChartConfig }) => {
    const _bgColor = opts.w.config.colors[opts.seriesIndex];
    const _label = opts.w.config.labels[opts.seriesIndex];
    const _total = opts.series.reduce((acc, cur) => (acc += cur), 0);
    const _value = opts.series[opts.seriesIndex];
    const _percent = ((_value / _total) * 100).toFixed(2) + '%';
    return `
      <div dir="${this.lang.isLtr ? 'ltr' : 'rtl'}"
        class="apexcharts-tooltip-series-group apexcharts-active"
        style="order: 1; display: flex; background-color: ${_bgColor}">
        <span class="apexcharts-tooltip-marker" style="background-color: ${_bgColor}; display: none"></span>
        <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">
          <div class="apexcharts-tooltip-y-group">
            <span class="apexcharts-tooltip-text-y-label">${_label}: </span
            ><span class="apexcharts-tooltip-text-y-value">${this.appChartTypesService.dataLabelsFormatter(
              { val: _value },
              this.rootData
            )} ${this.valueUnit ? this.valueUnit + ' ' : ''}<span class="font-normal">(${_percent})</span></span>
          </div>
        </div>
      </div>
    `;
  };
}
