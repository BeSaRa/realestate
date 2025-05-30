import { KpiBaseDurationModel } from '@abstracts/kpi-base-duration-model';
import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  effect,
  inject,
  runInInjectionContext,
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
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { ChartType } from '@enums/chart-type';
import { DurationEndpoints } from '@enums/durations';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartOptionsModel } from '@models/chart-options-model';
import { KpiBase } from '@models/kpi-base';
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
  selector: 'app-stacked-duration-chart',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconButtonComponent,
    NgApexchartsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    SelectInputComponent,
  ],
  templateUrl: './stacked-duration-chart.component.html',
  styleUrls: ['./stacked-duration-chart.component.scss'],
})
export class StackedDurationChartComponent
  extends OnDestroyMixin(class {})
  implements OnChanges, OnInit, AfterViewInit, OnDestroy
{
  @Input({ required: true }) title!: string;
  @Input({ required: true }) seriesNames!: Record<number, () => string>;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) rootData!: { chartDataUrl: string; hasPrice: boolean; hasSqUnit?: boolean };
  @Input({ required: true }) bindDataSplitProp!: string;
  @Input() showSelectChartType = true;
  @Input() changeBarColorsAccordingToValue = false;
  @Input() showStartYearFilter = false;

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

  selectedDurationType = DurationEndpoints.YEARLY;
  prevDurationType: DurationEndpoints = DurationEndpoints.YEARLY;
  selectedChartType: ChartType = ChartType.LINE;
  selectedBarChartType = BarChartTypes.SINGLE_BAR;
  chartSeriesData: DurationSeriesDataContract[] = [];
  chartDataLength = 0;

  chartOptions = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
  });

  yearlyOrMonthlyChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
  });

  halfyChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
    series: [],
  });

  quarterlyChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
    series: [],
  });

  barColorsAccordingToValue: Record<number, Record<number, string>>[] = [];

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

  ngOnInit(): void {
    this._initializeStackedSeriesOptions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateChartType(ChartType.BAR);
      this._initializeFormatters();
      this._listenToScreenSize();
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
      this.updateChartDataYearly();
      this.selectedBarChartType = BarChartTypes.SINGLE_BAR;
    } else if (this.selectedDurationType === DurationEndpoints.MONTHLY) {
      this.updateChartDataMonthly();
      this.selectedBarChartType = BarChartTypes.SINGLE_BAR;
    } else if (this.selectedDurationType === DurationEndpoints.HALFY) {
      this.updateChartDataHalfyOrQuarterly();
      this.selectedBarChartType = BarChartTypes.DOUBLE_BAR;
    } else {
      this.updateChartDataHalfyOrQuarterly();
      this.selectedBarChartType = BarChartTypes.QUAD_BAR;
    }

    this.isMonthlyDuration();
  }

  updateChartDataYearly() {
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
        data.sort((a, b) => a.issueYear - b.issueYear);
        const _data = this._splitAccordingToDataSplitProp(data);

        this.chartSeriesData = Object.keys(this.seriesNames).map((type) => ({
          name: this.seriesNames[type as unknown as number](),
          group: '0',
          data:
            _data[type as unknown as number]?.map((i) => {
              return { y: i.getKpiVal(), x: i.issueYear.toString() };
            }) ?? [],
        }));

        this.chartOptions = this.yearlyOrMonthlyChartOptions;
        this._updateChartOptions();
      });
  }

  updateChartDataMonthly() {
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
        const _data = this._splitAccordingToDataSplitProp(data as unknown as KpiBaseModel[]) as unknown as Record<
          number,
          KpiBaseDurationModel[]
        >;

        if (data.length) {
          Object.keys(this.seriesNames).forEach((type) => {
            months.forEach((m, i) => {
              const _currentDate = new Date();
              if (this.criteria.issueDateYear === _currentDate.getFullYear()) {
                if (i >= _currentDate.getMonth()) return;
              }
              if (!_data[type as unknown as number].find((item) => item.issuePeriod === i + 1)) {
                _data[type as unknown as number].push(
                  KpiBase.kpiDurationFactory(false).clone<KpiBaseDurationModel>({ issuePeriod: i + 1 })
                );
              }
            });
            _data[type as unknown as number].sort((a, b) => a.issuePeriod - b.issuePeriod);
          });
        }

        this.chartSeriesData = Object.keys(this.seriesNames).map((type) => ({
          name: this.seriesNames[type as unknown as number](),
          data: _data[type as unknown as number]
            .map((i) => ({
              y: i.getKpiVal(),
              x: months[i.issuePeriod - 1],
            }))
            .sort((a, b) => parseInt(a.x) - parseInt(b.x)),
        }));

        this.chartOptions = this.yearlyOrMonthlyChartOptions;

        this._updateChartOptions();
      });
  }

  updateChartDataHalfyOrQuarterly() {
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
        map(
          (data) =>
            this._splitAccordingToDataSplitProp(data as unknown as KpiBaseModel[]) as unknown as Record<
              number,
              KpiBaseDurationModel[]
            >
        ),
        map((data) => {
          return Object.keys(this.seriesNames).reduce(
            (acc, cur) => ({
              ...acc,
              [cur]: this.dashboardService.mapDurationData(
                data[cur as unknown as number],
                this.selectedDurationType === DurationEndpoints.HALFY
                  ? this.lookupService.sellLookups.halfYearDurations
                  : this.lookupService.sellLookups.quarterYearDurations
              ),
            }),
            {} as Record<number, DurationDataContract>
          );
        })
      )
      .subscribe((data) => {
        if (this.changeBarColorsAccordingToValue) this._initializeBarColorsAccordingToValue(data);

        this.chartSeriesData = [];
        Object.keys(this.seriesNames).forEach((type) => {
          this.chartSeriesData.push(
            ...Object.keys(data[type as unknown as number]).map((key, index) => ({
              name:
                this.seriesNames[type as unknown as number]() +
                ': ' +
                data[type as unknown as number][key as unknown as number].period.getNames(),
              group: index.toString(),
              data: data[type as unknown as number][key as unknown as number].kpiValues.map((item) => ({
                y: item.getKpiVal(),
                x: item.issueYear,
              })),
            }))
          );
        });

        this.chartOptions =
          this.selectedDurationType === DurationEndpoints.HALFY ? this.halfyChartOptions : this.quarterlyChartOptions;
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

    const _data: DurationSeriesDataContract[] = [];

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
      _data.push(_newSeries);
    });

    this.chartDataLength = _data[0].data.length;

    setTimeout(() => {
      this.chart.first
        .updateOptions({
          chart: {
            type: this.selectedChartType,
            stacked: this.selectedChartType === ChartType.BAR,
            ...this.appChartTypesService.getDownloadOptions(
              this.title,
              this.selectedDurationType === DurationEndpoints.MONTHLY ? this.lang.map.month : this.lang.map.year
            ),
          },
          stroke: { width: this.selectedChartType === ChartType.BAR ? 0 : 4 },
          dataLabels: { enabled: this.selectedDurationType !== DurationEndpoints.QUARTERLY },

          series: _data,
          ...this._getColorsOptions(),
          ...this._getTooltipOptions(),
          ...this._getLegendOptions(),
          ...this.appChartTypesService.getRangeOptions(
            this.screenSize,
            this.selectedBarChartType,
            this.chartDataLength,
            true
          ),
        })
        .then(() => {
          this.cdr.detectChanges();
        });
    }, 0);
  }

  private _splitAccordingToDataSplitProp(data: KpiBaseModel[]) {
    const _data: Record<number, KpiBaseModel[]> = Object.keys(this.seriesNames).reduce((acc, cur) => {
      acc[cur as unknown as number] = [];
      return acc;
    }, {} as Record<number, KpiBaseModel[]>);
    data.forEach((d) => {
      _data[d[this.bindDataSplitProp as keyof KpiBaseModel] as number].push(d);
    });
    return _data;
  }

  private _initializeStackedSeriesOptions() {
    Object.keys(this.seriesNames).forEach(() => {
      this.halfyChartOptions.series?.push(
        ...[
          { group: '0', data: [] },
          { group: '1', data: [] },
        ]
      );
      this.quarterlyChartOptions.series?.push(
        ...[
          { group: '0', data: [] },
          { group: '1', data: [] },
          { group: '2', data: [] },
          { group: '3', data: [] },
        ]
      );
    });
  }

  private _initializeFormatters() {
    [this.chartOptions, this.yearlyOrMonthlyChartOptions, this.halfyChartOptions, this.quarterlyChartOptions].forEach(
      (chart, index) =>
        chart
          .addDataLabelsFormatter((val, opts) =>
            this.appChartTypesService.dataLabelsFormatter({ val, opts }, { hasPrice: index === 5 })
          )
          .addAxisYFormatter((val, opts) =>
            this.appChartTypesService.axisYFormatter({ val, opts }, { hasPrice: index === 5 })
          )
          .addCustomToolbarOptions()
    );
  }

  private _listenToScreenSize() {
    this.screenService.screenSizeObserver$
      .pipe(takeUntil(this.destroy$))
      .pipe(takeUntil(this.destroy$))
      .subscribe((size) => {
        this.screenSize = size;
        this.chart.first
          .updateOptions(
            this.appChartTypesService.getRangeOptions(size, this.selectedBarChartType, this.chartDataLength, true)
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

  private _initializeBarColorsAccordingToValue(data: Record<number, DurationDataContract>) {
    const _sortedColors = [
      [AppColors.PRIMARY, AppColors.PRIMARY_80, AppColors.PRIMARY_60, AppColors.PRIMARY_40],
      [AppColors.SECONDARY, AppColors.SECONDARY_80, AppColors.SECONDARY_60, AppColors.SECONDARY_40],
    ];
    this.barColorsAccordingToValue = [];
    let kpiValues: number[] = [];

    for (let i = 0; i < data[Object.keys(data)[0] as unknown as number][1].kpiValues.length; i++) {
      const _pointColors = {} as Record<number, Record<number, string>>;
      Object.keys(this.seriesNames).forEach((type, _index) => {
        kpiValues = Object.keys(data[type as unknown as number]).map((duration) => {
          return data[type as unknown as number][duration as unknown as number].kpiValues[i].getKpiVal();
        });
        kpiValues = kpiValues.sort((a, b) => b - a);
        _pointColors[_index % 2] = kpiValues.reduce((acc, cur, index) => {
          return { ...acc, [cur]: _sortedColors[_index % 2][index] };
        }, {});
      });
      this.barColorsAccordingToValue.push(_pointColors);
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
            (opts: { value: number; seriesIndex: number; dataPointIndex: number }) => {
              const _barsCount = this.selectedDurationType === DurationEndpoints.HALFY ? 2 : 4;
              return this.barColorsAccordingToValue[opts.dataPointIndex][Math.floor(opts.seriesIndex / _barsCount) % 2][
                opts.value
              ];
            },
          ],
        };
      } else if (this.selectedDurationType === DurationEndpoints.HALFY) {
        return {
          colors: [AppColors.PRIMARY, AppColors.PRIMARY_80, AppColors.SECONDARY, AppColors.SECONDARY_80].map((c) =>
            this.selectedChartType === ChartType.AREA ? c + '50' : c
          ),
        };
      } else {
        return {
          colors: [
            AppColors.PRIMARY,
            AppColors.PRIMARY_80,
            AppColors.PRIMARY_60,
            AppColors.PRIMARY_40,
            AppColors.SECONDARY,
            AppColors.SECONDARY_80,
            AppColors.SECONDARY_60,
            AppColors.SECONDARY_40,
          ].map((c) => (this.selectedChartType === ChartType.AREA ? c + '50' : c)),
        };
      }
    } else {
      return {
        colors: [AppColors.PRIMARY, AppColors.SECONDARY].map((c) =>
          this.selectedChartType === ChartType.AREA ? c + '50' : c
        ),
      };
    }
  };

  private _getTooltipOptions() {
    return {
      tooltip: {
        marker: {
          show: !(
            this.changeBarColorsAccordingToValue &&
            (this.selectedDurationType === DurationEndpoints.HALFY ||
              this.selectedDurationType === DurationEndpoints.QUARTERLY) &&
            this.selectedChartType === ChartType.BAR
          ),
          fillColors:
            this.selectedDurationType === DurationEndpoints.YEARLY ||
            this.selectedDurationType === DurationEndpoints.MONTHLY
              ? [AppColors.PRIMARY, AppColors.SECONDARY]
              : this.selectedDurationType === DurationEndpoints.HALFY
              ? [AppColors.PRIMARY, AppColors.PRIMARY_80, AppColors.SECONDARY, AppColors.SECONDARY_80]
              : [
                  AppColors.PRIMARY,
                  AppColors.PRIMARY_80,
                  AppColors.PRIMARY_60,
                  AppColors.PRIMARY_40,
                  AppColors.SECONDARY,
                  AppColors.SECONDARY_80,
                  AppColors.SECONDARY_60,
                  AppColors.SECONDARY_40,
                ],
        },
      },
    };
  }

  private _getLegendOptions() {
    return {
      legend: {
        show: !(
          this.changeBarColorsAccordingToValue &&
          (this.selectedDurationType === DurationEndpoints.HALFY ||
            this.selectedDurationType === DurationEndpoints.QUARTERLY) &&
          this.selectedChartType === ChartType.BAR
        ),
      },
    };
  }
}
