import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy, EventEmitter, Output, QueryList, ViewChildren, inject } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { AppColors } from '@constants/app-colors';
import { CriteriaContract } from '@contracts/criteria-contract';
import { DurationDataContract } from '@contracts/duration-data-contract';
import { DurationSeriesDataContract } from '@contracts/duration-series-data-contract';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { ChartType } from '@enums/chart-type';
import { DurationEndpoints } from '@enums/durations';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartOptionsModel } from '@models/chart-options-model';
import { KpiModel } from '@models/kpi-model';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { minMaxAvg } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';
import { Observable, Subject, catchError, combineLatest, map, take, takeUntil, throwError } from 'rxjs';

@Component({
  selector: 'app-duration-chart',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconButtonComponent,
    NgApexchartsModule,
    FormatNumbersPipe,
    NgxMaskPipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './duration-chart.component.html',
  styleUrls: ['./duration-chart.component.scss'],
})
export class DurationChartComponent extends OnDestroyMixin(class {}) implements AfterViewInit, OnDestroy {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) filterCriteria$!: Observable<CriteriaContract | undefined>;
  @Input({ required: true }) rootData$!: Observable<
    { chartDataUrl: string; hasPrice: boolean; makeUpdate?: boolean } | undefined
  >;
  @Input() showSelectChartType = true;
  @Input() changeBarColorsAccordingToValue = false;

  @Output() isMonthltyDurationTypeEvent = new EventEmitter<boolean>();

  @ViewChildren('chart') chart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  appChartTypesService = inject(AppChartTypesService);
  adapter = inject(DateAdapter);
  screenService = inject(ScreenBreakpointsService);

  screenSize = Breakpoints.LG;
  isLoading = false;

  criteria!: CriteriaContract;
  rootData!: { chartDataUrl: string; hasPrice: boolean };

  protected readonly ChartType = ChartType;
  protected readonly DurationTypes = DurationEndpoints;

  selectedChartType: ChartType = ChartType.LINE;
  selectedDurationType: DurationEndpoints = DurationEndpoints.YEARLY;
  prevDurationType: DurationEndpoints = DurationEndpoints.YEARLY;
  selectedBarChartType = BarChartTypes.SINGLE_BAR;

  chartSeriesData: DurationSeriesDataContract[] = [];
  minMaxAvgChartData!: MinMaxAvgContract;
  durationDataLength = 0;

  isMinMaxAvgBar = false;

  nonMinMaxAvgBarChartOptions: ChartOptionsModel = new ChartOptionsModel().clone<ChartOptionsModel>(
    this.appChartTypesService.mainChartOptions
  );
  minMaxAvgBarChartOptions: ChartOptionsModel = new ChartOptionsModel().clone<ChartOptionsModel>(
    this.appChartTypesService.minMaxAvgBarChartOptions
  );

  chartOptions: ChartOptionsModel = this.nonMinMaxAvgBarChartOptions;

  barColorsAccordingToValue: Record<number, string>[] = [];

  ngAfterViewInit(): void {
    // this.chart.setDirty();
    setTimeout(() => {
      this.updateChartType(ChartType.BAR);
      this._listenToCriteriaAndRootChange();
      this._initializeFormatters();
    }, 0);
    setTimeout(() => {
      this._listenToScreenSizeChange();
    }, 0);
  }

  updateChartType(type: ChartType) {
    this.selectedChartType = type;
    this._updateChartOptions();
  }

  isMonthlyDuration() {
    this.isMonthltyDurationTypeEvent.emit(this.selectedDurationType == this.DurationTypes.MONTHLY);
  }

  updateChartDataForDuration(durationType: DurationEndpoints, isLoadingNewData = false) {
    if (this.selectedDurationType === durationType && !isLoadingNewData) return;
    this.isLoading = true;
    this.prevDurationType = this.selectedDurationType;
    this.selectedDurationType = durationType;
    if (this.selectedDurationType === DurationEndpoints.YEARLY) {
      this._updateForYearly();
      this.selectedBarChartType = BarChartTypes.SINGLE_BAR;
    } else if (this.selectedDurationType === DurationEndpoints.MONTHLY) {
      this._updateForMonthly();
      this.selectedBarChartType = BarChartTypes.SINGLE_BAR;
    } else if (this.selectedDurationType === DurationEndpoints.HALFY) {
      this._updateForHalfyOrQuarterly();
      this.selectedBarChartType = BarChartTypes.DOUBLE_BAR;
    } else {
      this._updateForHalfyOrQuarterly();
      this.selectedBarChartType = BarChartTypes.QUAD_BAR;
    }

    this.isMonthlyDuration();
  }

  private _updateForYearly(): void {
    if (!this.chart.length) return;

    this.dashboardService
      .loadChartKpiData<KpiModel>(this.rootData, this.criteria)
      .pipe(
        take(1),
        catchError((err) => {
          this.isLoading = false;
          this.selectedDurationType = this.prevDurationType;
          return throwError(() => err);
        })
      )
      .subscribe((data) => {
        this.durationDataLength = data.length;
        this.minMaxAvgChartData = minMaxAvg(data.map((item) => item.kpiVal));
        this.chartSeriesData = [
          {
            name: this.name,
            data: data.map((item) => ({
              y: item.kpiVal,
              x: item.issueYear,
              yoy: item.kpiYoYVal,
              baseYear: item.issueBaseYear ?? 2019,
              yoyBase: item.kpiYoYBaseVal,
            })),
          },
        ];
        this._updateChartOptions();
      });
  }

  private _updateForMonthly() {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const months = this.adapter.getMonthNames('long');
    this.dashboardService
      .loadChartKpiDataForDuration(DurationEndpoints.MONTHLY, this.rootData, this.criteria)
      .pipe(
        take(1),
        catchError((err) => {
          this.isLoading = false;
          this.selectedDurationType = this.prevDurationType;
          return throwError(() => err);
        })
      )
      .subscribe((data) => {
        this.durationDataLength = data.length;
        this.minMaxAvgChartData = minMaxAvg(data.map((d) => d.kpiVal));
        data.sort((a, b) => a.issuePeriod - b.issuePeriod);
        this.chartSeriesData = [
          {
            name: this.name,
            data: data.map((item) => {
              return {
                y: item.kpiVal,
                x: months[item.issuePeriod - 1],
              };
            }),
          },
        ];
        this._updateChartOptions();
      });
  }

  private _updateForHalfyOrQuarterly() {
    this.dashboardService
      .loadChartKpiDataForDuration(
        this.selectedDurationType === DurationEndpoints.HALFY ? DurationEndpoints.HALFY : DurationEndpoints.QUARTERLY,
        this.rootData,
        this.criteria
      )
      .pipe(
        take(1),
        catchError((err) => {
          this.isLoading = false;
          this.selectedDurationType = this.prevDurationType;
          return throwError(() => err);
        })
      )
      .pipe(
        map((durationData) => {
          return this.dashboardService.mapDurationData(
            durationData,
            this.selectedDurationType === DurationEndpoints.HALFY
              ? this.lookupService.sellLookups.halfYearDurations
              : this.lookupService.sellLookups.quarterYearDurations
          );
        })
      )
      .subscribe((data) => {
        if (this.changeBarColorsAccordingToValue) this._initializeBarColorsAccordingToValue(data);

        this.durationDataLength = data[1].kpiValues.length;
        this.chartSeriesData = Object.keys(data).map((key) => ({
          name: data[key as unknown as number].period.getNames(),
          data: data[key as unknown as number].kpiValues.map((item) => ({ y: item.kpiVal, x: item.issueYear })),
        }));
        this._updateChartOptions();
      });
  }

  private _updateChartOptions() {
    this.isLoading = false;
    if (!this.chartSeriesData.length) {
      return;
    }

    if (
      this.selectedDurationType === DurationEndpoints.HALFY ||
      this.selectedDurationType === DurationEndpoints.QUARTERLY
    ) {
      this.isMinMaxAvgBar = false;
      this.chartOptions = this.nonMinMaxAvgBarChartOptions;
    } else {
      if (this.selectedChartType === ChartType.BAR) {
        this.isMinMaxAvgBar = true;
        this.chartOptions = this.minMaxAvgBarChartOptions;
      } else {
        this.isMinMaxAvgBar = false;
        this.chartOptions = this.nonMinMaxAvgBarChartOptions;
      }
    }

    const _seriesData = this.isMinMaxAvgBar
      ? this.appChartTypesService.getSplittedSeriesChartOptions(this.chartSeriesData ?? [], [this.minMaxAvgChartData])
      : { series: this.chartSeriesData ?? [] };

    setTimeout(() => {
      this.chart.first
        ?.updateOptions({
          chart: { type: this.selectedChartType },
          stroke: { width: this.selectedChartType === ChartType.BAR ? 0 : 4 },
          ..._seriesData,
          ...this._getLegendOptions(),
          ...this._getColorsOptions(),
          ...this.appChartTypesService.getRangeOptions(
            this.screenSize,
            this.selectedBarChartType,
            this.durationDataLength,
            this.isMinMaxAvgBar
          ),
        })
        .then();
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
        this.updateChartDataForDuration(this.selectedDurationType, true);
      });
  }

  private _initializeFormatters() {
    [this.nonMinMaxAvgBarChartOptions, this.minMaxAvgBarChartOptions].forEach((options) => {
      options
        .addDataLabelsFormatter((val, opts) =>
          this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.rootData)
        )
        .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, this.rootData))
        .addCustomToolbarOptions()
        .addDurationCustomTooltip(this._durationCustomTooltip, this.isMinMaxAvgBar);
    });
  }

  private _listenToScreenSizeChange() {
    this.screenService.screenSizeObserver$.pipe(takeUntil(this.destroy$)).subscribe((size) => {
      this.screenSize = size;
      this.chart.first?.updateOptions(
        this.appChartTypesService.getRangeOptions(
          size,
          this.selectedBarChartType,
          this.durationDataLength,
          this.isMinMaxAvgBar
        )
      );
    });
  }

  private _initializeBarColorsAccordingToValue(data: DurationDataContract) {
    const _sortedColors = [AppColors.PRIMARY, AppColors.SECONDARY, AppColors.LEAD_80, AppColors.LEAD_60];
    this.barColorsAccordingToValue = [];
    let kpiValues: number[] = [];
    for (let i = 0; i < data[1].kpiValues.length; i++) {
      kpiValues = Object.keys(data).map((duration) => {
        return data[duration as unknown as number].kpiValues[i].kpiVal;
      });
      kpiValues = kpiValues.sort((a, b) => b - a);
      this.barColorsAccordingToValue.push(
        kpiValues.reduce((acc, cur, index) => {
          return { ...acc, [cur]: _sortedColors[index] };
        }, {})
      );
    }
  }

  private _getColorsOptions = () => {
    if (
      this.selectedDurationType === DurationEndpoints.HALFY ||
      this.selectedDurationType === DurationEndpoints.QUARTERLY
    ) {
      if (this.changeBarColorsAccordingToValue && this.selectedChartType === ChartType.BAR) {
        return {
          colors: [
            (opts: { value: number; dataPointIndex: number }) =>
              this.barColorsAccordingToValue[opts.dataPointIndex][opts.value],
          ],
        };
      } else {
        return {
          colors: [
            AppColors.PRIMARY,
            AppColors.SECONDARY,
            AppColors.LEAD,
            AppColors.LEAD_80,
            AppColors.LEAD_60,
            AppColors.LEAD_40,
            AppColors.GRAY,
            AppColors.GRAY_TOO,
            AppColors.BLACK,
          ],
        };
      }
    } else if (this.selectedChartType !== ChartType.BAR) {
      return { colors: [AppColors.PRIMARY] };
    }
    return {};
  };

  private _getLegendOptions = () => {
    return {
      legend: {
        show:
          this.selectedChartType !== ChartType.BAR ||
          (!this.changeBarColorsAccordingToValue &&
            (this.selectedDurationType === DurationEndpoints.HALFY ||
              this.selectedDurationType === DurationEndpoints.QUARTERLY)),
      },
    };
  };

  private _durationCustomTooltip = (opts: { seriesIndex: number; dataPointIndex: number }) => {
    const _series =
      this.selectedDurationType === DurationEndpoints.HALFY || this.selectedDurationType === DurationEndpoints.QUARTERLY
        ? this.chartSeriesData[opts.seriesIndex]
        : this.chartSeriesData[0];
    const _dataPoint = _series?.data[opts.dataPointIndex];
    if (
      this.selectedDurationType === DurationEndpoints.MONTHLY ||
      this.selectedDurationType === DurationEndpoints.HALFY ||
      this.selectedDurationType === DurationEndpoints.QUARTERLY
    ) {
      return this._getDurationDefaultTooltipTemplate(_dataPoint.x, _dataPoint.y, _series.name ?? '');
    } else {
      return this._getDurationCustomTooltipTemplate(
        _dataPoint.x,
        _dataPoint.y,
        _dataPoint.yoy ?? 0,
        _dataPoint.baseYear ?? 2019,
        _dataPoint.yoyBase ?? 0,
        _series.name ?? ''
      );
    }
  };

  private _getDurationDefaultTooltipTemplate(x: string | number, y: number, name: string) {
    return `
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">${x}</div>
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex">
        <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${name}: </span>
            <span class="apexcharts-tooltip-text-y-value">${this.appChartTypesService.axisYFormatter(
              {
                val: y,
              },
              this.rootData
            )}</span>
          </div>
        </div>
      </div>
    `;
  }

  private _getDurationCustomTooltipTemplate(
    x: string | number,
    y: number,
    yoy: number,
    baseYear: number,
    yoyBase: number,
    name: string
  ) {
    return `
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">${x}</div>
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex">
        <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${name}: </span>
            <span class="apexcharts-tooltip-text-y-value">${this.appChartTypesService.axisYFormatter(
              {
                val: y,
              },
              this.rootData
            )}</span>
          </div>
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${this.lang.map.annually}: </span>
            <span class="apexcharts-tooltip-text-y-value">${yoy.toFixed(1)}%</span>
          </div>
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${this.lang.map.vs} ${baseYear}: </span>
            <span class="apexcharts-tooltip-text-y-value">${yoyBase.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    `;
  }

  getMinMaxAvgLegendData() {
    return {
      min: this.appChartTypesService.dataLabelsFormatter({ val: this.minMaxAvgChartData?.min ?? 0 }, this.rootData),
      max: this.appChartTypesService.dataLabelsFormatter({ val: this.minMaxAvgChartData?.max ?? 0 }, this.rootData),
      avg: this.appChartTypesService.dataLabelsFormatter({ val: this.minMaxAvgChartData?.avg ?? 0 }, this.rootData),
    };
  }
}
