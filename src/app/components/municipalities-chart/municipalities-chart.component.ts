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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonComponent } from '@components/button/button.component';
import { AppColors } from '@constants/app-colors';
import { CriteriaContract } from '@contracts/criteria-contract';
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { ChartType } from '@enums/chart-type';
import { CriteriaType } from '@enums/criteria-type';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartConfig, ChartContext, ChartOptionsModel, DataPointSelectionConfig } from '@models/chart-options-model';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { MunicipalityService } from '@services/municipality.service';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { TranslationService } from '@services/translation.service';
import { minMaxAvg, objectHasOwnProperty } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { catchError, map, take, takeUntil, throwError } from 'rxjs';
import { QatarInteractiveMapComponent } from 'src/app/components/qatar-interactive-map/qatar-interactive-map.component';

@Component({
  selector: 'app-municipalities-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, QatarInteractiveMapComponent, ButtonComponent, MatProgressSpinnerModule],
  templateUrl: './municipalities-chart.component.html',
  styleUrls: ['./municipalities-chart.component.scss'],
})
export class MunicipalitiesChartComponent extends OnDestroyMixin(class {}) implements OnChanges, AfterViewInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) seriesNames!: Record<number, () => string>;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) criteriaType!: CriteriaType;
  @Input({ required: true }) rootData!: { chartDataUrl: string; hasPrice: boolean };
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input({ required: true }) unit!: string;
  @Input() bindDataSplitProp!: string;
  @Input() useOVMunicipalityLookups = false;
  @Input() enableAllChoiceOnMap = false;
  @Input() defaultAllValue: number | null = -1;

  @ViewChildren('chart') chart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  appChartTypesService = inject(AppChartTypesService);
  screenService = inject(ScreenBreakpointsService);
  cdr = inject(ChangeDetectorRef);
  municipalityService = inject(MunicipalityService);

  screenSize = Breakpoints.LG;

  isChartFirstUpdate = true;
  isUpdatingChartData = false;
  isCriteriaMunicipalityChanged = false;
  seriesData: Record<number, (KpiBaseModel & { municipalityId: number })[]> = {};
  seriesDataLength = 0;
  selectedMunicipality = { id: 0, seriesIndex: 0, dataPointIndex: 0 };

  chartOptions = new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.mainChartOptions);

  readonly ChartType = ChartType;
  selectedChartType = ChartType.BAR;

  isLoading = false;

  mapSeriesData = [{ label: '', data: [] as (KpiBaseModel & { municipalityId: number })[] }];

  seriesSumData: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['rootData'] && changes['rootData'].currentValue !== changes['rootData'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.rootData || !this.criteria) return;
      if (this.criteriaType === CriteriaType.FROM_MUNICIPALITY_CHART) return;
      setTimeout(() => {
        if (this.selectedMunicipality.id !== this.criteria.municipalityId && this.seriesData[0]?.length) {
          this.selectedMunicipality.id = this.criteria.municipalityId;
          this.isCriteriaMunicipalityChanged = true;
          this.updateChartOptions();
        } else {
          this.selectedMunicipality.id = this.criteria.municipalityId;
          this.updateChartData();
        }
      }, 0);
    }
  }

  ngAfterViewInit(): void {
    this._initializeFormatters();
    setTimeout(() => {
      this.chart.first?.updateOptions({ chart: { type: 'bar', height: 430 } }).then();
      this._listenToScreenSizeChange();
      this._listenToLangChange();
    }, 0);
  }

  updateChartData() {
    this.isUpdatingChartData = true;
    this.isLoading = true;

    const _criteria = { ...this.criteria, municipalityId: this.defaultAllValue as unknown as number };
    if (this.bindDataSplitProp) delete _criteria[this.bindDataSplitProp as keyof CriteriaContract];
    if (_criteria.areaCode) _criteria.areaCode = -1;
    if (_criteria.zoneId) _criteria.zoneId = -1;

    this.dashboardService
      .loadChartKpiData(this.rootData, _criteria)
      .pipe(take(1))
      .pipe(
        catchError((err) => {
          this.isLoading = false;
          return throwError(() => err);
        })
      )
      .pipe(map((data) => data as unknown as (KpiBaseModel & { municipalityId: number })[]))

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
                data[key as unknown as number].find(
                  (i) => this._getLabel(i) === this._getLabel(item)
                ) as KpiBaseModel & { municipalityId: number }
              );
            });
          });
          return _sortedData;
        })
      )
      .subscribe((data) => {
        this.seriesData = data;
        this.seriesDataLength = data[Object.keys(this.seriesNames)[0] as unknown as number].length;
        this.seriesSumData = Object.keys(this.seriesData).map((key) => {
          return this.seriesData[key as unknown as number].reduce((acc, cur) => (acc += cur.getKpiVal()), 0);
        });

        this.updateMapSeriesData();
        this.updateChartOptions();
      });
  }

  updateChartOptions() {
    this.isLoading = false;
    const _minMaxAvg = minMaxAvg(
      this.seriesData[Object.keys(this.seriesNames)[0] as unknown as number]?.map((item) => item.getKpiVal()) ?? []
    );
    this.chart.first
      ?.updateOptions({
        series: Object.keys(this.seriesData).map((key) => ({
          name: this.seriesNames[key as unknown as number](),
          data: this.seriesData[key as unknown as number].map((item, index) => ({
            x: this._getLabel(item),
            y: item.getKpiVal(),
            id: item.municipalityId,
            index,
          })),
        })),
        chart: {
          stacked: Object.keys(this.seriesNames).length !== 1,
          ...this.appChartTypesService.getDownloadOptions(this.title, this.lang.map.municipal),
        },
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
          // Object.keys(this.seriesNames).length !== 1
          true
        ),
      })
      .then();
  }

  updateMapSeriesData() {
    this.mapSeriesData = [];
    Object.keys(this.seriesNames ?? []).forEach((key, i) => {
      this.mapSeriesData.push({
        label: this.seriesNames[key as unknown as number](),
        data: this.seriesData[key as unknown as number],
      });
    });
  }

  onMapSelectedMunicipalityChanged(event: KpiBaseModel & { municipalityId: number }) {
    this.selectedMunicipality.id = event.municipalityId;
    this.isCriteriaMunicipalityChanged = true;

    this.updateChartOptions();

    this.municipalityService.emitMunicipalityChangeFromChart(this.selectedMunicipality.id);
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

  private _listenToLangChange() {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateMapSeriesData();
      this.updateChartOptions();
    });
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
            // Object.keys(this.seriesNames).length !== 1
            true
          )
        )
        .then(() => {
          this.cdr.detectChanges();
        });
    });
  }

  private _initializeFormatters() {
    this.chartOptions
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.rootData)
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, this.rootData))
      .addUpdatedCallback(this._onMunicipalitiesChartUpdated)
      .addDataPointSelectionCallback(this._onMunicipalitiesChartDataPointSelection)
      .addCustomToolbarOptions()
      .addCustomTooltip(this._getCustomTooltipTemplate, true);
  }

  private _onMunicipalitiesChartUpdated = (chartContext: ChartContext, config: ChartConfig) => {
    const hasData = (config.config.series?.[0]?.data as { x: number; y: number; id: number }[] | undefined)?.filter(
      (item) => item.id
    ).length;
    if (!hasData) {
      return;
    }
    if (this.isChartFirstUpdate) {
      // doing this because of strange apexchart behaviour when it's display is none
      setTimeout(() => {
        this.selectedChartType = ChartType.MAP;
      }, 500);
      this.isChartFirstUpdate = false;

      if (this.selectedMunicipality.id === -1) return;
      this.chart.first?.toggleDataPointSelection(
        0,
        (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).filter(
          (item) => item.id === this.selectedMunicipality.id
        )[0]?.index ?? -1
      );
    } else {
      if (!this.isUpdatingChartData && !this.isCriteriaMunicipalityChanged) return;
      if (
        this.selectedMunicipality.dataPointIndex < (chartContext.w.config.series[0].data as unknown[]).length &&
        config.globals.selectedDataPoints.some((s) => s.length)
      ) {
        this.chart.first?.toggleDataPointSelection(
          this.selectedMunicipality.seriesIndex,
          this.selectedMunicipality.dataPointIndex
        );
      }

      if (
        this.seriesData[Object.keys(this.seriesNames)[0] as unknown as number].find(
          (d) => d.municipalityId === this.selectedMunicipality.id
        ) !== undefined
      ) {
        this.chart.first?.toggleDataPointSelection(
          0,
          (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).filter(
            (item) => item.id === this.selectedMunicipality.id
          )[0]?.index ?? -1
        );
      }
    }
  };

  private _onMunicipalitiesChartDataPointSelection = (
    event: MouseEvent,
    chartContext: ChartContext,
    config: DataPointSelectionConfig
  ) => {
    this.chart.first?.clearAnnotations();

    if (config.selectedDataPoints[config.seriesIndex].length === 0) return;
    if (!event && !this.isChartFirstUpdate && !this.isUpdatingChartData && !this.isCriteriaMunicipalityChanged) return;
    this.isUpdatingChartData = false;
    this.isCriteriaMunicipalityChanged = false;

    this.selectedMunicipality = {
      id: event
        ? (chartContext.w.config.series[config.seriesIndex].data[config.dataPointIndex] as unknown as { id: number }).id
        : this.selectedMunicipality.id,
      seriesIndex: config.seriesIndex,
      dataPointIndex: config.dataPointIndex,
    };

    const _municipalityName = this._getLabel({ municipalityId: this.selectedMunicipality.id });
    if (
      this.seriesData[Object.keys(this.seriesNames)[0] as unknown as number].find(
        (d) => d.municipalityId === this.selectedMunicipality.id
      ) !== undefined
    ) {
      this.chart.first?.addXaxisAnnotation(
        this.appChartTypesService.getXAnnotaionForSelectedBar(_municipalityName),
        true
      );
    }

    if (event) {
      this.municipalityService.emitMunicipalityChangeFromChart(this.selectedMunicipality.id);
    }
  };

  private _getCustomTooltipTemplate = (opts: { seriesIndex: number; dataPointIndex: number }) => {
    const _colors = [AppColors.PRIMARY, AppColors.SECONDARY];

    return `
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">${this._getLabel(
      this.seriesData[Object.keys(this.seriesData)[0] as unknown as number][opts.dataPointIndex]
    )}</div>
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex">
        <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">
          ${Object.keys(this.seriesData)
            .map(
              (key, index) => `
          <div class="apexcharts-tooltip-y-group flex justify-between items-center gap-2">
            <span class="apexcharts-tooltip-marker" style="background-color: ${_colors[index % 2]};"></span>
            <span class="apexcharts-tooltip-text-y-label">${this.seriesNames[key as unknown as number]() ?? ''}: </span>
            <span class="apexcharts-tooltip-text-y-value">${this.appChartTypesService.axisYFormatter(
              {
                val: this.seriesData[key as unknown as number][opts.dataPointIndex].getKpiVal(),
              },
              this.rootData
            )} (${(
                (this.seriesData[key as unknown as number][opts.dataPointIndex].getKpiVal() /
                  this.seriesSumData[key as unknown as number]) *
                100
              ).toFixed(0)}%)</span>
          </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  };
}
