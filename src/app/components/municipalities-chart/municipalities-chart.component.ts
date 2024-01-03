import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
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
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartConfig, ChartContext, ChartOptionsModel, DataPointSelectionConfig } from '@models/chart-options-model';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
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
export class MunicipalitiesChartComponent extends OnDestroyMixin(class {}) implements OnChanges, OnInit, AfterViewInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) seriesNames!: Record<number, () => string>;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) rootData!: { chartDataUrl: string; hasPrice: boolean };
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input({ required: true }) unit!: string;
  @Input({ required: true }) initialMunicipalityId!: number;
  @Input() bindDataSplitProp!: string;
  @Input() useOVMunicipalityLookups = false;

  @Output() selectedMunicipalityChanged = new EventEmitter<{ municipalityId: number }>();

  @ViewChildren('chart') chart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  appChartTypesService = inject(AppChartTypesService);
  screenService = inject(ScreenBreakpointsService);
  cdr = inject(ChangeDetectorRef);

  screenSize = Breakpoints.LG;

  isChartFirstUpdate = true;
  isUpdatingChartData = false;
  seriesData: Record<number, (KpiBaseModel & { municipalityId: number })[]> = {};
  seriesDataLength = 0;
  selectedMunicipality = { id: 0, seriesIndex: 0, dataPointIndex: 0 };

  chartOptions = new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.mainChartOptions);

  readonly ChartType = ChartType;
  selectedChartType = ChartType.BAR;

  isLoading = false;

  mapSeriesData = [{ label: '', data: [] as (KpiBaseModel & { municipalityId: number })[] }];

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

  ngOnInit(): void {
    this.selectedMunicipality.id = this.initialMunicipalityId;
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

    const _criteria = { ...this.criteria };
    if (this.bindDataSplitProp) delete _criteria[this.bindDataSplitProp as keyof CriteriaContract];

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
          Object.keys(this.seriesNames).length !== 1
        ),
      })
      .then();

    setTimeout(() => {
      if (this.selectedChartType === ChartType.MAP)
        this.selectedMunicipalityChanged.emit({ municipalityId: this.selectedMunicipality.id });
    }, 0);
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
    const _pointIndex = (this.selectedMunicipality.dataPointIndex = this.seriesData[
      Object.keys(this.seriesNames)[0] as unknown as number
    ].findIndex((m) => m.municipalityId === event.municipalityId));

    this.isUpdatingChartData = true;

    this.selectedMunicipality.id = event.municipalityId;
    this.selectedMunicipality.dataPointIndex = _pointIndex;

    this.selectedMunicipalityChanged.emit({ municipalityId: this.selectedMunicipality.id });
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
            Object.keys(this.seriesNames).length !== 1
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
      .addCustomToolbarOptions();
  }

  private _onMunicipalitiesChartUpdated = (chartContext: ChartContext, config: ChartConfig) => {
    const hasData = (config.config.series?.[0]?.data as { x: number; y: number; id: number }[] | undefined)?.filter(
      (item) => item.id
    ).length;
    if (!hasData) {
      return;
    }
    if (this.isChartFirstUpdate) {
      this.chart.first?.toggleDataPointSelection(
        0,
        (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).filter(
          (item) => item.id === this.selectedMunicipality.id
        )[0].index
      );
    } else {
      if (!this.isUpdatingChartData) return;
      if (this.selectedMunicipality.dataPointIndex < (chartContext.w.config.series[0].data as unknown[]).length) {
        this.chart.first?.toggleDataPointSelection(
          this.selectedMunicipality.seriesIndex,
          this.selectedMunicipality.dataPointIndex
        );
      }
      this.chart.first?.toggleDataPointSelection(
        0,
        (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).length - 1
      );
    }
  };

  private _onMunicipalitiesChartDataPointSelection = (
    event: MouseEvent,
    chartContext: ChartContext,
    config: DataPointSelectionConfig
  ) => {
    if (config.selectedDataPoints[config.seriesIndex].length === 0) return;
    if (!event && !this.isChartFirstUpdate && !this.isUpdatingChartData) return;
    this.isUpdatingChartData = false;

    this.selectedMunicipality = {
      id: (chartContext.w.config.series[config.seriesIndex].data[config.dataPointIndex] as unknown as { id: number })
        .id,
      seriesIndex: config.seriesIndex,
      dataPointIndex: config.dataPointIndex,
    };
    const _municipalityName = this._getLabel({ municipalityId: this.selectedMunicipality.id });
    this.chart.first?.clearAnnotations();
    this.chart.first?.addXaxisAnnotation(
      this.appChartTypesService.getXAnnotaionForSelectedBar(_municipalityName),
      true
    );

    // doing this because of strange apexchart behaviour when it's display is none
    if (this.isChartFirstUpdate) {
      this.isChartFirstUpdate = false;
      setTimeout(() => {
        this.selectedChartType = ChartType.MAP;
      }, 500);
    }

    this.selectedMunicipalityChanged.emit({ municipalityId: this.selectedMunicipality.id });
  };
}
