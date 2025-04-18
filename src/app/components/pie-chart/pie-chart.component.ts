import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren,
  effect,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PieChartOptions } from '@app-types/pie-chart-options';
import { CriteriaContract } from '@contracts/criteria-contract';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartConfig } from '@models/chart-options-model';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { objectHasOwnProperty } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { catchError, take, takeUntil, throwError } from 'rxjs';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatProgressSpinnerModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent extends OnDestroyMixin(class {}) implements OnInit, OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) rootData!: { chartDataUrl: string; hasPrice: boolean; hasSqUnit?: boolean };
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input() bindValue: string | ((item: any) => number) = 'getKpiVal';
  @Input() valueUnit?: string;

  @ViewChildren('pieChart') pieChart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  appChartTypesService = inject(AppChartTypesService);
  dashboardService = inject(DashboardService);
  cdr = inject(ChangeDetectorRef);
  unitsService = inject(UnitsService);
  injector = inject(Injector);

  isLoading = false;
  dataLength = 0;

  pieChartOptions: PieChartOptions = {
    ...this.appChartTypesService.pieChartOptions,
    tooltip: {
      custom: (opts) => this._getPieCustomTooltip(opts),
    },
  };

  ngOnInit(): void {
    setTimeout(() => {
      this._listenToUnitChange();
      this._listenToLangChange();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['rootData'] && changes['rootData'].currentValue !== changes['rootData'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.rootData || !this.criteria) return;
      setTimeout(() => {
        this._updatePieChartData();
      }, 0);
    }
  }

  private _updatePieChartData() {
    this.isLoading = true;
    this.dashboardService
      .loadChartKpiData(this.rootData, this.criteria)
      .pipe(
        take(1),
        catchError((err) => {
          this.isLoading = false;
          return throwError(() => err);
        })
      )
      .subscribe((data) => {
        data.sort((a, b) => b.getKpiVal() - a.getKpiVal());
        this.dataLength = data.length;

        this.isLoading = false;
        this.pieChart.first
          ?.updateOptions({
            series: data.map((item) => this._getValue(item)),
            labels: data.map((item) => this._getLabel(item)),
          })
          .then(() => {
            this.cdr.detectChanges();
          });
      });
  }

  private _listenToUnitChange() {
    runInInjectionContext(this.injector, () =>
      effect(() => {
        this.unitsService.selectedUnit();
        if (this.rootData.hasSqUnit) this._updatePieChartData();
      })
    );
  }

  private _listenToLangChange() {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe(() => this._updatePieChartData());
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
    return (
      (this.bindLabel && typeof this.bindLabel === 'string'
        ? typeof (item as never)[this.bindLabel] === 'function'
          ? ((item as never)[this.bindLabel] as () => string)()
          : objectHasOwnProperty(item, this.bindLabel)
          ? (item[this.bindLabel] as string)
          : (item as unknown as string)
        : this.bindLabel && typeof this.bindLabel === 'function'
        ? (this.bindLabel(item) as string)
        : (item as unknown as string)) ?? this.appChartTypesService.getUndefinedLabel()
    );
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
