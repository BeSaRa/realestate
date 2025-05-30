import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  effect,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  runInInjectionContext,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
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
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { UrlService } from '@services/url.service';
import { minMaxAvg, range } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { catchError, map, take, takeUntil, throwError } from 'rxjs';

@Component({
  selector: 'app-duration-chart',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconButtonComponent,
    NgApexchartsModule,
    MatProgressSpinnerModule,
    SelectInputComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './duration-chart.component.html',
  styleUrls: ['./duration-chart.component.scss'],
})
export class DurationChartComponent extends OnDestroyMixin(class {}) implements OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) rootData!: { chartDataUrl: string; hasPrice: boolean; hasSqUnit?: boolean };
  @Input() showSelectChartType = true;
  @Input() changeBarColorsAccordingToValue = false;
  @Input() showStartYearFilter = false;
  @Input() hasMinMaxAvg = false;

  @Output() isMonthltyDurationTypeEvent = new EventEmitter<boolean>();

  @ViewChildren('chart') chart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  appChartTypesService = inject(AppChartTypesService);
  adapter = inject(DateAdapter);
  screenService = inject(ScreenBreakpointsService);
  cdr = inject(ChangeDetectorRef);
  unitsService = inject(UnitsService);
  injector = inject(Injector);

  screenSize = Breakpoints.LG;
  isLoading = false;

  protected readonly ChartType = ChartType;
  protected readonly DurationTypes = DurationEndpoints;

  selectedChartType: ChartType = ChartType.LINE;
  selectedDurationType: DurationEndpoints = DurationEndpoints.YEARLY;
  prevDurationType: DurationEndpoints = DurationEndpoints.YEARLY;
  selectedBarChartType = BarChartTypes.SINGLE_BAR;

  chartSeriesData: DurationSeriesDataContract[] = [];
  filteredChartSeriesData: DurationSeriesDataContract[] = [];
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

  yearsRange = [new Date().getFullYear()];
  fromYearControl = new FormControl<number | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['rootData'] && changes['rootData'].currentValue !== changes['rootData'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.rootData || !this.criteria) return;
      setTimeout(() => {
        this.updateChartDataForDuration(this.selectedDurationType, true);
      }, 0);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateChartType(ChartType.BAR);
      this._initializeFormatters();
      this._listenToScreenSizeChange();
      this._listenToUnitChange();
      this._listenToLangChange();

      this.fromYearControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (!this.isLoading) this._updateChartOptions();
      });
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
      .loadChartKpiData(this.rootData, this.criteria)
      .pipe(
        take(1),
        catchError((err) => {
          this.isLoading = false;
          this.selectedDurationType = this.prevDurationType;
          return throwError(() => err);
        })
      )
      .subscribe((data) => {
        this.minMaxAvgChartData = minMaxAvg(data.map((item) => item.getKpiVal()));
        this.chartSeriesData = [
          {
            name: this.name,
            data: data.map((item) => ({
              y: item.getKpiVal(),
              x: item.issueYear.toString(),
              yoy: item.getKpiYoYVal(),
              baseYear: data[0].issueYear,
              yoyBase: ((item.getKpiVal() - data[0].getKpiVal()) / data[0].getKpiVal()) * 100,
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
        this.minMaxAvgChartData = minMaxAvg(data.map((d) => d.getKpiVal()));
        data.sort((a, b) => a.issuePeriod - b.issuePeriod);
        this.chartSeriesData = [
          {
            name: this.name,
            data: data.map((item) => {
              return {
                y: item.getKpiVal(),
                x: months[item.issuePeriod - 1],
                P2Pyoy: item.getKpiP2PYoY(),
                PreviousPeriodRate: Number((item.getKpiP2PDifference() / 100).toFixed(1)),
                baseYear: item.issueYear ? item.issueYear - 1 : this.criteria.issueDateYear - 1,
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

        this.chartSeriesData = Object.keys(data).map((key) => ({
          name: data[key as unknown as number].period.getNames(),
          data: data[key as unknown as number].kpiValues.map((item) => ({
            y: item.getKpiVal(),
            x: item.issueYear.toString(),
          })),
        }));
        this._updateChartOptions();
      });
  }

  private _updateChartOptions() {
    if (!this.chartSeriesData.length) {
      this.isLoading = false;
      return;
    }

    if (this.isLoading && this.showStartYearFilter && this.selectedDurationType !== DurationEndpoints.MONTHLY) {
      const _minMaxYears = minMaxAvg((this.chartSeriesData[0]?.data ?? []).map((item) => parseInt(item.x.toString())));
      this.yearsRange = range(_minMaxYears.min, _minMaxYears.max);
      if (!this.yearsRange.find((year) => year === parseInt(this.fromYearControl.value?.toString() ?? ''))) {
        this.fromYearControl.setValue(null, { emitEvent: false });
      }
    }

    this.isLoading = false;

    if (this.selectedDurationType === DurationEndpoints.MONTHLY && this.showStartYearFilter) {
      this.fromYearControl.disable({ emitEvent: false });
      this.fromYearControl.setValue(null, { emitEvent: false });
    } else this.fromYearControl.enable({ emitEvent: false });

    if (
      this.selectedDurationType === DurationEndpoints.HALFY ||
      this.selectedDurationType === DurationEndpoints.QUARTERLY
    ) {
      this.isMinMaxAvgBar = false;
      this.chartOptions = this.nonMinMaxAvgBarChartOptions;
    } else {
      if (this.selectedChartType === ChartType.BAR && this.hasMinMaxAvg) {
        this.isMinMaxAvgBar = true;
        this.chartOptions = this.minMaxAvgBarChartOptions;
      } else {
        this.isMinMaxAvgBar = false;
        this.chartOptions = this.nonMinMaxAvgBarChartOptions;
      }
    }

    this.filteredChartSeriesData = [];

    this.chartSeriesData.forEach((s) => {
      const _newSeries = structuredClone(s) as DurationSeriesDataContract;
      if (
        this.showStartYearFilter &&
        this.selectedDurationType !== DurationEndpoints.MONTHLY &&
        this.fromYearControl.value
      ) {
        _newSeries.data = _newSeries.data.filter((item) => {
          return parseInt(item.x.toString()) >= (this.fromYearControl.value ?? 0);
        });
      }
      this.filteredChartSeriesData.push(_newSeries);
    });

    this.durationDataLength = this.filteredChartSeriesData[0].data.length;

    const _seriesData = this.isMinMaxAvgBar
      ? this.appChartTypesService.getSplittedSeriesChartOptions(this.filteredChartSeriesData ?? [], [
          this.minMaxAvgChartData,
        ])
      : { series: this.filteredChartSeriesData ?? [] };

    setTimeout(() => {
      this.chart.first
        ?.updateOptions({
          chart: {
            type: this.selectedChartType,
            ...this.appChartTypesService.getDownloadOptions(
              this.title,
              this.selectedDurationType === DurationEndpoints.MONTHLY ? this.lang.map.month : this.lang.map.year
            ),
          },
          dataLabels: { enabled: this.selectedDurationType != this.DurationTypes.QUARTERLY && !this.isMinMaxAvgBar },
          stroke: { width: this.selectedChartType === ChartType.BAR ? 0 : 4 },
          ..._seriesData,
          ...this._getLegendOptions(),
          ...this._getColorsOptions(),
          ...this.appChartTypesService.getRangeOptions(
            this.screenSize,
            this.selectedBarChartType,
            this.durationDataLength,
            // this.isMinMaxAvgBar
            true
          ),
        })
        .then(() => {
          this.cdr.detectChanges();
        });
    }, 0);
  }

  private _initializeFormatters() {
    [this.nonMinMaxAvgBarChartOptions, this.minMaxAvgBarChartOptions].forEach((options) => {
      options
        .addDataLabelsFormatter((val, opts) =>
          this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.rootData)
        )
        .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, this.rootData))
        .addCustomToolbarOptions()
        .addCustomTooltip(this._durationCustomTooltip, this.isMinMaxAvgBar);
    });
  }

  private _listenToScreenSizeChange() {
    this.screenService.screenSizeObserver$.pipe(takeUntil(this.destroy$)).subscribe((size) => {
      this.screenSize = size;
      this.chart.first
        ?.updateOptions(
          this.appChartTypesService.getRangeOptions(
            size,
            this.selectedBarChartType,
            this.durationDataLength,
            // this.isMinMaxAvgBar
            true
          )
        )
        .then(() => {
          this.cdr.detectChanges();
        });
    });
  }

  private _listenToUnitChange() {
    runInInjectionContext(this.injector, () =>
      effect(() => {
        this.unitsService.selectedUnit();
        if (this.rootData.hasSqUnit) this.updateChartDataForDuration(this.selectedDurationType, true);
      })
    );
  }

  private _listenToLangChange() {
    this.lang.change$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateChartDataForDuration(this.selectedDurationType, true));
  }

  private _initializeBarColorsAccordingToValue(data: DurationDataContract) {
    const _sortedColors = [AppColors.PRIMARY, AppColors.SECONDARY, AppColors.LEAD_80, AppColors.LEAD_60];
    this.barColorsAccordingToValue = [];
    let kpiValues: number[] = [];
    for (let i = 0; i < data[1].kpiValues.length; i++) {
      kpiValues = Object.keys(data).map((duration) => {
        return data[duration as unknown as number].kpiValues[i].getKpiVal();
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
      this.selectedDurationType === DurationEndpoints.QUARTERLY ||
      !this.hasMinMaxAvg
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
          ].map((c) => (this.selectedChartType === ChartType.AREA ? c + '50' : c)),
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
        ? this.filteredChartSeriesData[opts.seriesIndex]
        : this.filteredChartSeriesData[0];
    const _dataPoint = _series?.data[opts.dataPointIndex];
    if (
      // this.selectedDurationType === DurationEndpoints.MONTHLY ||
      this.selectedDurationType === DurationEndpoints.HALFY ||
      this.selectedDurationType === DurationEndpoints.QUARTERLY
    ) {
      return this._getDurationDefaultTooltipTemplate(opts.dataPointIndex);
    }
    if (this.selectedDurationType === DurationEndpoints.MONTHLY) {
      return this._getDurationCustomTooltipTemplate(
        _dataPoint.x,
        _dataPoint.y,
        _dataPoint.P2Pyoy ?? 0,
        _dataPoint.baseYear ?? 2019,
        _dataPoint.PreviousPeriodRate ?? 0,
        _series.name ?? ''
      );
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

  private _getDurationDefaultTooltipTemplate(dataPointIndex: number) {
    const _colors = [AppColors.PRIMARY, AppColors.SECONDARY, AppColors.LEAD_80, AppColors.LEAD_60];
    return `
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">${
      this.filteredChartSeriesData[0].data[dataPointIndex].x
    }</div>
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex">
        <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">
          ${this.filteredChartSeriesData
            .map(
              (series, index) => `
          <div class="apexcharts-tooltip-y-group flex justify-between items-center gap-2">
            ${
              this.selectedDurationType === DurationEndpoints.MONTHLY
                ? ``
                : `<span class="apexcharts-tooltip-marker" style="background-color: ${_colors[index]};"></span>`
            }
            <span class="apexcharts-tooltip-text-y-label">${series.name ?? ''}: </span>
            <span class="apexcharts-tooltip-text-y-value">${this.appChartTypesService.axisYFormatter(
              {
                val: series.data[dataPointIndex].y,
              },
              this.rootData
            )}</span>
          </div>
          `
            )
            .join('')}
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
            <span class="apexcharts-tooltip-text-y-label">${
              this.selectedDurationType == this.DurationTypes.YEARLY ? this.lang.map.annually : this.lang.map.monthly
            }: </span>
            <span class="apexcharts-tooltip-text-y-value" dir="ltr">${yoy.toFixed(1)}%</span>
          </div>
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${this.lang.map.vs} ${baseYear}: </span>
            <span class="apexcharts-tooltip-text-y-value" dir="ltr">${yoyBase.toFixed(1)}%</span>
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
