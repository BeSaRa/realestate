import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChildren,
  inject,
} from '@angular/core';
import { AppColors } from '@constants/app-colors';
import { CriteriaContract } from '@contracts/criteria-contract';
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartOptionsModel } from '@models/chart-options-model';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { minMaxAvg, objectHasOwnProperty } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { map, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-areas-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './areas-chart.component.html',
  styleUrls: ['./areas-chart.component.scss'],
})
export class AreasChartComponent extends OnDestroyMixin(class {}) implements OnChanges, AfterViewInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) seriesNames!: Record<number, string>;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) rootData!: { chartDataUrl: string; hasPrice: boolean };
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input() bindDataSplitProp!: string;

  @ViewChildren('chart') chart!: QueryList<ChartComponent>;

  dashboardService = inject(DashboardService);
  appChartTypesService = inject(AppChartTypesService);
  screenService = inject(ScreenBreakpointsService);
  cdr = inject(ChangeDetectorRef);

  screenSize = Breakpoints.LG;

  seriesData: Record<number, KpiBaseModel[]> = {};
  seriesDataLength = 0;

  chartOptions = new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.mainChartOptions);

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['rootData'] && changes['rootData'].currentValue !== changes['rootData'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.rootData || !this.criteria) return;
      setTimeout(() => {
        this.updateChartData();
      }, 0);
    }
  }

  ngAfterViewInit(): void {
    this._initializeFormatters();
    setTimeout(() => {
      this.chart.first?.updateOptions({ chart: { type: 'bar' } }).then();
      this._listenToScreenSizeChange();
    }, 0);
  }

  updateChartData() {
    this.dashboardService
      .loadChartKpiData(
        {
          chartDataUrl: this.rootData.chartDataUrl,
        },
        this.criteria
      )
      .pipe(take(1))
      .pipe(
        map((data) => {
          if (Object.keys(this.seriesNames).length === 1) {
            return { [Object.keys(this.seriesNames)[0] as unknown as number]: data };
          }
          const _data = {} as Record<number, typeof data>;
          Object.keys(this.seriesNames).forEach((key) => {
            _data[key as unknown as number] = [];
          });
          return data.reduce((acc, cur) => {
            acc[cur[this.bindDataSplitProp as keyof KpiBaseModel] as number].push(cur);
            return acc;
          }, _data);
        })
      )
      .pipe(
        map((data) => {
          // sorting logic
          data[Object.keys(this.seriesNames)[0] as unknown as number].sort((a, b) => {
            let _sumA = a?.getKpiVal() ?? 0;
            let _sumB = b?.getKpiVal() ?? 0;
            Object.keys(data).forEach((key, index) => {
              if (index === 0) return;

              _sumA +=
                data[key as unknown as number]
                  .find((item) => this._getLabel(item) === this._getLabel(a))
                  ?.getKpiVal() ?? 0;

              _sumB +=
                data[key as unknown as number]
                  .find((item) => this._getLabel(item) === this._getLabel(b))
                  ?.getKpiVal() ?? 0;
            });
            return _sumA - _sumB;
          });
          const _sortedData: typeof data = {};
          _sortedData[Object.keys(this.seriesNames)[0] as unknown as number] =
            data[Object.keys(this.seriesNames)[0] as unknown as number];
          Object.keys(data).forEach((key, index) => {
            if (index === 0) return;
            _sortedData[key as unknown as number] = [];
            _sortedData[Object.keys(this.seriesNames)[0] as unknown as number].forEach((item) => {
              _sortedData[key as unknown as number].push(
                data[key as unknown as number].find((i) => this._getLabel(i) === this._getLabel(item)) as KpiBaseModel
              );
            });
          });
          return _sortedData;
        })
      )

      .subscribe((data) => {
        this.seriesData = data;
        this.seriesDataLength = data[Object.keys(this.seriesNames)[0] as unknown as number].length;
        this.updateChartOptions();
      });
  }

  updateChartOptions() {
    const _minMaxAvg = minMaxAvg(
      this.seriesData[Object.keys(this.seriesNames)[0] as unknown as number].map((item) => item?.getKpiVal() ?? 0)
    );
    this.chart.first
      ?.updateOptions({
        series: Object.keys(this.seriesData).map((key) => ({
          name: this.seriesNames[key as unknown as number],
          data: this.seriesData[key as unknown as number].map((item) => ({
            x: this._getLabel(item),
            y: item?.getKpiVal() ?? 0,
          })),
        })),
        chart: { stacked: Object.keys(this.seriesNames).length !== 1 },
        stroke: { width: 0 },
        colors:
          Object.keys(this.seriesNames).length !== 1
            ? [AppColors.PRIMARY, AppColors.SECONDARY]
            : [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
        states: {
          active: {
            filter: {
              type: 'none',
              value: 0,
            },
          },
        },
        ...this.appChartTypesService.getRangeOptions(
          this.screenSize,
          BarChartTypes.SINGLE_BAR,
          this.seriesDataLength,
          Object.keys(this.seriesNames).length !== 1
        ),
      })
      .then();
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

  private _initializeFormatters() {
    this.chartOptions
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.rootData)
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, this.rootData))
      .addCustomToolbarOptions();
  }

  private _listenToScreenSizeChange() {
    this.screenService.screenSizeObserver$.pipe(takeUntil(this.destroy$)).subscribe((size) => {
      this.screenSize = size;
      this.chart.first
        ?.updateOptions(
          this.appChartTypesService.getRangeOptions(
            size,
            BarChartTypes.SINGLE_BAR,
            this.seriesDataLength,
            Object.keys(this.seriesNames).length !== 1
          )
        )
        .then(() => {
          this.cdr.detectChanges();
        });
    });
  }
}
