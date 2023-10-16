import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { AppColors } from '@constants/app-colors';
import { CriteriaContract } from '@contracts/criteria-contract';
import { DurationSeriesDataContract } from '@contracts/duration-series-data-contract';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { ChartType } from '@enums/chart-type';
import { DurationEndpoints } from '@enums/durations';
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
export class DurationChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) filterCriteria$!: Observable<CriteriaContract | undefined>;
  @Input({ required: true }) rootData$!: Observable<
    { chartDataUrl: string; hasPrice: boolean; makeUpdate?: boolean } | undefined
  >;
  @Input() showSelectChartType = true;

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

  destroy$ = new Subject<void>();

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

  ngOnInit(): void {}

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  updateChartType(type: ChartType) {
    this.selectedChartType = type;
    this._updateChart();
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
        this._updateChart();
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
        this._updateChart();
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
        this.durationDataLength = data[1].kpiValues.length;
        this.chartSeriesData = Object.keys(data).map((key) => ({
          name: data[key as unknown as number].period.getNames(),
          data: data[key as unknown as number].kpiValues.map((item) => ({ y: item.kpiVal, x: item.issueYear })),
        }));
        this._updateChart();
      });
  }

  private _updateChart() {
    if (!this.chartSeriesData.length) {
      return;
    }
    let _staticOptions = {};
    if (
      this.selectedDurationType === DurationEndpoints.HALFY ||
      this.selectedDurationType === DurationEndpoints.QUARTERLY
    ) {
      this.isMinMaxAvgBar = false;
      this.chartOptions = this.nonMinMaxAvgBarChartOptions;
      _staticOptions = this.appChartTypesService.halflyAndQuarterlyStaticChartOptions;
    } else {
      if (this.selectedChartType === ChartType.BAR) {
        this.isMinMaxAvgBar = true;
        this.chartOptions = this.minMaxAvgBarChartOptions;
        _staticOptions = {};
      } else {
        this.isMinMaxAvgBar = false;
        this.chartOptions = this.nonMinMaxAvgBarChartOptions;
        _staticOptions = { colors: [AppColors.PRIMARY], ...this.appChartTypesService.yearlyStaticChartOptions };
      }
    }
    this._updateOptions(_staticOptions);
  }

  private _updateOptions(staticOptions: any) {
    this.isLoading = false;
    const _seriesData = this.isMinMaxAvgBar
      ? this.appChartTypesService.getSplittedSeriesChartOptions(this.chartSeriesData ?? [], [this.minMaxAvgChartData])
      : { series: this.chartSeriesData ?? [] };
    setTimeout(() => {
      this.chart.first
        ?.updateOptions({
          chart: { type: this.selectedChartType },
          ..._seriesData,
          ...staticOptions,
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
        .addDurationCustomTooltip((opts: { seriesIndex: number; dataPointIndex: number }) => {
          return this.appChartTypesService.durationCustomTooltip(
            opts,
            this.chartSeriesData,
            this.selectedDurationType,
            this.rootData.hasPrice,
            this.selectedDurationType === DurationEndpoints.HALFY ||
              this.selectedDurationType === DurationEndpoints.QUARTERLY
          );
        }, this.isMinMaxAvgBar);
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
}
