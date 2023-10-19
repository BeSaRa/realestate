import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ChartType } from '@enums/chart-type';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartOptionsModel } from '@models/chart-options-model';
import { Lookup } from '@models/lookup';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { objectHasOwnProperty } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { Observable, catchError, take, takeUntil, throwError } from 'rxjs';

@Component({
  selector: 'app-top-ten-chart',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconButtonComponent, NgApexchartsModule, MatProgressSpinnerModule],
  templateUrl: './top-ten-chart.component.html',
  styleUrls: ['./top-ten-chart.component.scss'],
})
export class TopTenChartComponent extends OnDestroyMixin(class {}) implements OnInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) filterCriteria$!: Observable<CriteriaContract | undefined>;
  @Input({ required: true }) selectedAccordingTo!: Lookup;
  @Input() accordingToList: Lookup[] = [];
  @Input() showSelectChartType = true;
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input() bindValue: string | ((item: any) => number) = 'kpiVal';

  @ViewChildren('chart') chart!: QueryList<ChartComponent>;

  appChartTypesService = inject(AppChartTypesService);
  dashboardService = inject(DashboardService);

  criteria!: CriteriaContract;

  isLoading = false;

  protected readonly ChartType = ChartType;

  selectedChartType: 'line' | 'bar' = ChartType.BAR;
  chartData: { kpiVal: number }[] = [];
  prevAccordingTo!: Lookup;

  chartOptions = {
    bar: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.bar),
    line: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.line),
  };

  ngOnInit(): void {
    setTimeout(() => {
      this._listenToCriteriaChange();
      this._initializeChartFormatters();
    }, 0);
  }

  selecteAccordingTo(_new: Lookup) {
    this.selectedAccordingTo = _new;

    this.updateChartData();
  }

  updateChartType(type: ChartType) {
    this.selectedChartType = type as 'line' | 'bar';
    this.chart.first.updateOptions(this.chartOptions[this.selectedChartType], true);
    this._updateOptions();
  }

  updateChartData() {
    this.isLoading = true;
    this.prevAccordingTo = this.selectedAccordingTo;

    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.selectedAccordingTo.url }, this.criteria)
      .pipe(
        take(1),
        catchError((err) => {
          this.isLoading = false;
          this.selectedAccordingTo = this.prevAccordingTo;
          return throwError(() => err);
        })
      )
      .subscribe((data) => {
        this.chartData = data;
        this._updateOptions();
      });
  }

  private _updateOptions(): void {
    this.isLoading = false;
    setTimeout(() => {
      this.chart.first
        .updateOptions({
          series: [
            {
              name: this.selectedAccordingTo.getNames(),
              data: this.chartData.map((item) => {
                return { x: this._getLabel(item), y: this._getValue(item) };
              }),
            },
          ],
        })
        .then();
    }, 0);
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

  private _listenToCriteriaChange() {
    this.filterCriteria$.pipe(takeUntil(this.destroy$)).subscribe((criteria) => {
      if (!criteria) return;
      this.criteria = criteria;
      this.updateChartData();
    });
  }

  private _initializeChartFormatters() {
    [this.chartOptions.line, this.chartOptions.bar].forEach((chart) => {
      chart
        .addDataLabelsFormatter((val, opts) =>
          this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.selectedAccordingTo)
        )
        .addAxisYFormatter((val, opts) =>
          this.appChartTypesService.axisYFormatter({ val, opts }, this.selectedAccordingTo)
        )
        .addAxisXFormatter((val, opts) =>
          this.appChartTypesService.axisXFormatter({ val, opts }, this.selectedAccordingTo)
        );
    });
  }
}
