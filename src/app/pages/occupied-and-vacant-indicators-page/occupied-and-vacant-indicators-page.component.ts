import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, QueryList, ViewChildren, inject } from '@angular/core';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PremiseTypesPopupComponent } from '@components/premise-types-popup/premise-types-popup.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { StackedDurationChartComponent } from '@components/stacked-duration-chart/stacked-duration-chart.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { AppColors } from '@constants/app-colors';
import { CriteriaContract } from '@contracts/criteria-contract';
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { CriteriaType } from '@enums/criteria-type';
import { OccupationStatus } from '@enums/occupation-status';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartConfig, ChartContext, ChartOptionsModel, DataPointSelectionConfig } from '@models/chart-options-model';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { DialogService } from '@services/dialog.service';
import { LookupService } from '@services/lookup.service';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { BehaviorSubject, map, take, takeUntil } from 'rxjs';
import { QatarInteractiveMapComponent } from 'src/app/qatar-interactive-map/qatar-interactive-map.component';

@Component({
  selector: 'app-occupied-and-vacant-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    KpiRootComponent,
    PurposeComponent,
    ButtonComponent,
    StackedDurationChartComponent,
    NgApexchartsModule,
    QatarInteractiveMapComponent,
  ],
  templateUrl: './occupied-and-vacant-indicators-page.component.html',
  styleUrls: ['./occupied-and-vacant-indicators-page.component.scss'],
})
export default class OccupiedAndVacantIndicatorsPageComponent
  extends OnDestroyMixin(class {})
  implements AfterViewInit
{
  @ViewChildren('municipalitiesChart') municipalitiesChart!: QueryList<ChartComponent>;
  @ViewChildren('areasChart') areasChart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  appChartTypesService = inject(AppChartTypesService);
  screenService = inject(ScreenBreakpointsService);
  dialog = inject(DialogService);

  screenSize = Breakpoints.LG;

  municipalities = this.lookupService.ovLookups.municipalityList;
  zones = this.lookupService.ovLookups.zoneList;
  areas = this.lookupService.ovLookups.districtList;
  occupancyStatuses = this.lookupService.ovLookups.occupancyStatusList;
  premiseCategories = this.lookupService.ovLookups.premiseCategoryList;
  premiseTypes = this.lookupService.ovLookups.premiseTypeList;

  criteria!: {
    criteria: CriteriaContract & { occupancyStatus: number | null };
    type: CriteriaType;
  };

  criteriaSubject = new BehaviorSubject<CriteriaContract | undefined>(undefined);
  criteria$ = this.criteriaSubject.asObservable();

  rootKPIS = [
    new KpiRoot(
      -1,
      this.lang.getArabicTranslation('total_number_of_units'),
      this.lang.getEnglishTranslation('total_number_of_units'),
      false,
      this.urlService.URLS.OV_KPI1,
      this.urlService.URLS.OV_KPI2,
      this.urlService.URLS.OV_KPI3,
      '',
      'assets/icons/kpi/svg/1.svg'
    ),
    new KpiRoot(
      0,
      this.lang.getArabicTranslation('total_number_of_vacant_units'),
      this.lang.getEnglishTranslation('total_number_of_vacant_units'),
      false,
      this.urlService.URLS.OV_KPI1,
      this.urlService.URLS.OV_KPI2,
      this.urlService.URLS.OV_KPI3,
      '',
      'assets/icons/kpi/svg/3.svg'
    ),

    new KpiRoot(
      1,
      this.lang.getArabicTranslation('total_number_of_occupied_units'),
      this.lang.getEnglishTranslation('total_number_of_occupied_units'),
      false,
      this.urlService.URLS.OV_KPI1,
      this.urlService.URLS.OV_KPI2,
      this.urlService.URLS.OV_KPI3,
      '',
      'assets/icons/kpi/svg/8.svg'
    ),
  ];

  selectedRoot = this.rootKPIS[0];

  categoryKPIs = this.lookupService.ovLookups.premiseCategoryList;
  selectedCategory = this.lookupService.ovLookups.premiseCategoryList[0];

  typeKPIs = this.lookupService.ovLookups.premiseTypeList;
  filteredTypeKPIs = this.typeKPIs;

  readonly shownTypeKpisCount = 14;

  totalCountChartData = {
    chartDataUrl: this.urlService.URLS.OV_KPI4,
    hasPrice: false,
  };

  totalCountChartNames: Record<number, string> = {
    [OccupationStatus.VACANT]: this.lang.map.vacant,
    [OccupationStatus.OCCUPIED]: this.lang.map.occupied,
  };

  isOnInitMunicipaliteisChart = true;
  isLoadingUpdatedMunicipalitiesData = false;
  selectedMunicipality = { id: 4, seriesIndex: 0, dataPointIndex: 0 };
  municipalitiesData: Record<number, (KpiModel & { municipalityId: number; occupancyStatus: number })[]> = {};
  municipalitiesDataLength = 0;

  municipalitiesChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>(
    this.appChartTypesService.mainChartOptions
  );

  areasDataLength = 0;

  areasChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.mainChartOptions);

  ngAfterViewInit(): void {
    this._initializeChartsFormatters();
    setTimeout(() => {
      this._listenToScreenSize();
      this.municipalitiesChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
      this.areasChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
    }, 0);
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria: criteria as CriteriaContract & { occupancyStatus: number | null }, type };
    this.criteriaSubject.next(criteria);

    if (type === CriteriaType.DEFAULT) return;

    this.rootKPIS.map((item) => {
      const _criteria = { ...this.criteria.criteria, occupancyStatus: item?.id === -1 ? null : item?.id ?? 0 };

      this.dashboardService
        .loadKpiRoot(item, _criteria)
        .pipe(take(1))
        .subscribe((value) => {
          if (!value.length) {
            item.setValue(0);
            item.setYoy(0);
          } else {
            item.setValue(value[value.length - 1].kpiVal);
            item.setYoy(value[value.length - 1].kpiYoYVal);
          }
        });
    });

    this.rootItemSelected(this.selectedRoot);
    setTimeout(() => {
      this.updateMunicipalitiesChartData();
    }, 0);
  }

  rootItemSelected(item?: KpiRoot) {
    if (!item) return;
    this.selectedRoot = item;

    const _criteria = { ...this.criteria.criteria, occupancyStatus: item?.id === -1 ? null : item?.id ?? 0 };

    this.rootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.dashboardService
      .loadPurposeKpi(item, _criteria)
      .pipe(take(1))
      .subscribe((subKPI) => {
        const _category = subKPI.reduce((acc, item) => {
          return { ...acc, [item['premiseCategoryId' as keyof KpiModel]]: item };
        }, {} as Record<number, KpiModel>);

        this.categoryKPIs = this.categoryKPIs.map((item) => {
          Object.prototype.hasOwnProperty.call(_category, item.lookupKey)
            ? (item.value = _category[item.lookupKey].kpiVal)
            : (item.value = 0);
          Object.prototype.hasOwnProperty.call(_category, item.lookupKey)
            ? (item.yoy = _category[item.lookupKey].kpiYoYVal)
            : (item.yoy = 0);
          return item;
        });
        this.selectedRoot && this.updateAllCategories(this.selectedRoot.value, this.selectedRoot.yoy);
        this.selectedCategory && this.categorySelected(this.selectedCategory);
        //   this.rootDataSubject.next(this.selectedRoot);
      });
  }

  updateAllCategories(value: number, yoy: number): void {
    const lookup = this.categoryKPIs.find((i) => i.lookupKey === -1);
    lookup && (lookup.value = value) && (lookup.yoy = yoy);
  }

  categorySelected(item: Lookup) {
    this.categoryKPIs.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.selectedCategory = item;

    const _criteria = {
      ...this.criteria.criteria,
      occupancyStatus: this.selectedRoot.id === -1 ? null : this.selectedRoot.id,
      ['premiseCategoryList' as keyof CriteriaContract]: [item.lookupKey],
    };

    this.selectedRoot &&
      this.dashboardService
        .loadPropertyTypeKpi(this.selectedRoot, _criteria)
        .pipe(take(1))
        .subscribe((result) => {
          const _types = result.reduce((acc, cur) => {
            return { ...acc, [cur['premiseTypeId' as keyof KpiModel]]: cur };
          }, {} as Record<number, KpiModel>);
          this.filteredTypeKPIs = this.typeKPIs
            .map((item) => {
              _types[item.lookupKey] ? (item.value = _types[item.lookupKey].kpiVal) : (item.value = 0);
              _types[item.lookupKey] ? (item.yoy = _types[item.lookupKey].kpiYoYVal) : (item.yoy = 0);
              return item;
            })
            .sort((a, b) => b.value - a.value)
            .filter((item) => item.value != 0);
        });
  }

  showAllPremiseTypes() {
    this.dialog.open(PremiseTypesPopupComponent, {
      data: {
        title: this.selectedRoot.getNames() + ' (' + this.lang.map.depending_on_type + ')',
        types: this.filteredTypeKPIs,
      },
      maxWidth: '95vw',
      minWidth: '95vw',
      maxHeight: '95vh',
    });
  }

  updateMunicipalitiesChartData() {
    this.isLoadingUpdatedMunicipalitiesData = true;
    const _criteria = {
      ...this.criteria.criteria,
      occupancyStatus: null,
    };
    // delete (_criteria as any).municipalityId;
    this.dashboardService
      .loadChartKpiData(
        {
          chartDataUrl: this.urlService.URLS.OV_KPI5,
        },
        _criteria
      )
      .pipe(take(1))
      .pipe(map((data) => data as unknown as (KpiModel & { municipalityId: number; occupancyStatus: number })[]))
      .pipe(
        map((data) =>
          data.reduce((acc, cur) => {
            if (!acc[OccupationStatus.OCCUPIED]) acc[OccupationStatus.OCCUPIED] = [];
            if (!acc[OccupationStatus.VACANT]) acc[OccupationStatus.VACANT] = [];
            acc[cur.occupancyStatus].push(cur);
            return acc;
          }, {} as Record<number, typeof data>)
        )
      )
      .subscribe((data) => {
        this.municipalitiesData = data;
        this.municipalitiesDataLength = data[OccupationStatus.OCCUPIED].length;

        this.updateMunicipalitiesBarChartData();
      });
  }

  updateMunicipalitiesBarChartData() {
    this.municipalitiesChart.first
      ?.updateOptions({
        series: Object.keys(this.municipalitiesData).map((status) => ({
          name: this.lookupService.ovOccupancyStatusMap[status as unknown as number].getNames(),
          data: this.municipalitiesData[status as unknown as number].map((item, index) => ({
            x: this.lookupService.ovMunicipalitiesMap[item.municipalityId]?.getNames() ?? '',
            y: item.kpiVal,
            id: item.municipalityId,
            index,
          })),
        })),
        chart: { stacked: true },
        stroke: { width: 0 },
        colors: [AppColors.PRIMARY, AppColors.SECONDARY],
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
          this.municipalitiesDataLength,
          true
        ),
      })
      .then();
  }

  onMapSelectedMunicipalityChanged(event: KpiModel & { municipalityId: number }) {
    this.selectedMunicipality.id = event.municipalityId;
    this.selectedMunicipality.dataPointIndex = this.municipalitiesData[OccupationStatus.OCCUPIED].findIndex(
      (m) => m.municipalityId === event.municipalityId
    );

    this.isLoadingUpdatedMunicipalitiesData = true;
    this.municipalitiesChart.first?.toggleDataPointSelection(0, this.selectedMunicipality.dataPointIndex);
  }

  updateAreasChartData() {
    const _criteria = {
      ...this.criteria.criteria,
      municipalityId: this.selectedMunicipality.id,
      occupancyStatus: null,
    };
    delete (_criteria as any).zoneId;
    this.dashboardService
      .loadChartKpiData(
        {
          chartDataUrl: this.urlService.URLS.OV_KPI6,
        },
        _criteria
      )
      .pipe(take(1))
      .pipe(map((data) => data as unknown as (KpiModel & { zoneNo: number; occupancyStatus: number })[]))
      .pipe(
        map((data) =>
          data.reduce((acc, cur) => {
            if (!acc[OccupationStatus.OCCUPIED]) acc[OccupationStatus.OCCUPIED] = [];
            if (!acc[OccupationStatus.VACANT]) acc[OccupationStatus.VACANT] = [];
            acc[cur.occupancyStatus].push(cur);
            return acc;
          }, {} as Record<number, typeof data>)
        )
      )
      .subscribe((data) => {
        this.areasDataLength = data[OccupationStatus.OCCUPIED].length;

        this.areasChart.first
          ?.updateOptions({
            series: Object.keys(data).map((status) => ({
              name: this.lookupService.ovOccupancyStatusMap[status as unknown as number].getNames(),
              data: data[status as unknown as number].map((item, index) => ({
                x: this.lookupService.ovZonesMap[item.zoneNo]?.getNames() ?? '',
                y: item.kpiVal,
                id: item.zoneNo,
                index,
              })),
            })),
            chart: { stacked: true },
            stroke: { width: 0 },
            colors: [AppColors.PRIMARY, AppColors.SECONDARY],

            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              BarChartTypes.SINGLE_BAR,
              this.areasDataLength,
              true
            ),
          })
          .then();
      });
  }

  private _initializeChartsFormatters() {
    this.municipalitiesChartOptions
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, { hasPrice: false })
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, { hasPrice: false }))
      .addUpdatedCallback(this._onMunicipalitiesChartUpdated)
      .addDataPointSelectionCallback(this._onMunicipalitiesChartDataPointSelection)
      .addCustomToolbarOptions();

    this.areasChartOptions
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, { hasPrice: false })
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, { hasPrice: false }))
      .addCustomToolbarOptions();
  }

  private _onMunicipalitiesChartUpdated = (chartContext: ChartContext, config: ChartConfig) => {
    const hasData = (config.config.series?.[0]?.data as { x: number; y: number; id: number }[] | undefined)?.filter(
      (item) => item.id
    ).length;
    if (!hasData) {
      return;
    }
    if (this.isOnInitMunicipaliteisChart) {
      this.municipalitiesChart.first?.toggleDataPointSelection(
        0,
        (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).filter(
          (item) => item.id === this.selectedMunicipality.id
        )[0].index
      );
    } else {
      if (!this.isLoadingUpdatedMunicipalitiesData) return;
      if (this.selectedMunicipality.dataPointIndex < (chartContext.w.config.series[0].data as unknown[]).length) {
        this.municipalitiesChart.first?.toggleDataPointSelection(
          this.selectedMunicipality.seriesIndex,
          this.selectedMunicipality.dataPointIndex
        );
      }
      this.municipalitiesChart.first?.toggleDataPointSelection(
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
    if (!event && !this.isOnInitMunicipaliteisChart && !this.isLoadingUpdatedMunicipalitiesData) return;
    this.isOnInitMunicipaliteisChart = false;
    this.isLoadingUpdatedMunicipalitiesData = false;
    this.selectedMunicipality = {
      id: (chartContext.w.config.series[config.seriesIndex].data[config.dataPointIndex] as unknown as { id: number })
        .id,
      seriesIndex: config.seriesIndex,
      dataPointIndex: config.dataPointIndex,
    };
    const _municipalityName = this.lookupService.ovMunicipalitiesMap[this.selectedMunicipality.id].getNames();
    this.municipalitiesChart.first?.clearAnnotations();
    this.municipalitiesChart.first?.addXaxisAnnotation(
      this.appChartTypesService.getXAnnotaionForSelectedBar(_municipalityName),
      true
    );
    this.updateAreasChartData();
  };

  _listenToScreenSize() {
    this.screenService.screenSizeObserver$.pipe(takeUntil(this.destroy$)).subscribe((size) => {
      this.screenSize = size;
      this.municipalitiesChart.first?.updateOptions(
        this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.municipalitiesDataLength, true)
      );
      this.areasChart.first?.updateOptions(
        this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.areasDataLength, true)
      );
    });
  }
}
