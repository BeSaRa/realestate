import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { ButtonComponent } from '@components/button/button.component';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PieChartComponent } from '@components/pie-chart/pie-chart.component';
import { PropertyCarouselComponent } from '@components/property-carousel/property-carousel.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { OwnerCriteriaContract } from '@contracts/owner-criteria-contract';
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { CriteriaType } from '@enums/criteria-type';
import { NationalityCategories } from '@enums/nationality-categories';
import { ChartConfig, ChartContext, ChartOptionsModel, DataPointSelectionConfig } from '@models/chart-options-model';
import { KpiBase } from '@models/kpi-base';
import { KpiPropertyType } from '@models/kpi-property-type';
import { KpiPurpose } from '@models/kpi-purpose';
import { KpiRoot } from '@models/kpi-root';
import { Lookup } from '@models/lookup';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { SectionTitleService } from '@services/section-title.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { UrlService } from '@services/url.service';
import { minMaxAvg } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';
import { Subject, map, take, takeUntil } from 'rxjs';
import { QatarInteractiveMapComponent } from 'src/app/qatar-interactive-map/qatar-interactive-map.component';

@Component({
  selector: 'app-owner-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    KpiRootComponent,
    PurposeComponent,
    PropertyCarouselComponent,
    ButtonComponent,
    IconButtonComponent,
    NgApexchartsModule,
    FormatNumbersPipe,
    YoyIndicatorComponent,
    NgxMaskPipe,
    MatNativeDateModule,
    QatarInteractiveMapComponent,
    DurationChartComponent,
    PieChartComponent,
  ],
  templateUrl: './ownership-indicators-page.component.html',
  styleUrls: ['./ownership-indicators-page.component.scss'],
})
export default class OwnershipIndicatorsPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('nationalitiesChart') nationalitiesChart!: QueryList<ChartComponent>;
  @ViewChildren('municipalitiesChart') municipalitiesChart!: QueryList<ChartComponent>;
  @ViewChildren('areasChart') areasChart!: QueryList<ChartComponent>;
  @ViewChildren('ownerTypeSummaryChart') ownerTypeSummaryChart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  appChartTypesService = inject(AppChartTypesService);
  screenService = inject(ScreenBreakpointsService);
  sectionTitle = inject(SectionTitleService);

  screenSize = Breakpoints.LG;

  destroy$ = new Subject<void>();

  municipalities = this.lookupService.ownerLookups.municipalityList;
  propertyTypes = this.lookupService.ownerLookups.propertyTypeList;
  propertyUsages = this.lookupService.ownerLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.ownerLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  nationalities = this.lookupService.ownerLookups.nationalityList;
  ownerTypes = this.lookupService.ownerLookups.ownerCategoryList;

  purposeKPIS = this.lookupService.ownerLookups.rentPurposeList.map((item) =>
    new KpiPurpose().clone<KpiPurpose>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );
  propertiesKPIS = this.lookupService.ownerLookups.propertyTypeList.map((item) =>
    new KpiPropertyType().clone<KpiPropertyType>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );

  criteria = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  nationalityCriteria!: CriteriaContract;

  rootKPIS = [
    new KpiRoot().clone<KpiRoot>({
      id: 1,
      arName: this.lang.getArabicTranslation('total_number_of_properties_units'),
      enName: this.lang.getEnglishTranslation('total_number_of_properties_units'),
      url: this.urlService.URLS.OWNER_KPI1,
      purposeUrl: this.urlService.URLS.OWNER_KPI2,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI3,
      iconUrl: 'assets/icons/kpi/svg/owner/1.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 4,
      arName: this.lang.getArabicTranslation('total_number_of_qatari_owners'),
      enName: this.lang.getEnglishTranslation('total_number_of_qatari_owners'),
      url: this.urlService.URLS.OWNER_KPI4,
      purposeUrl: this.urlService.URLS.OWNER_KPI5,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI6,
      iconUrl: 'assets/icons/kpi/svg/owner/2.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 7,
      arName: this.lang.getArabicTranslation('total_number_of_non_qatari_owners'),
      enName: this.lang.getEnglishTranslation('total_number_of_non_qatari_owners'),
      url: this.urlService.URLS.OWNER_KPI7,
      purposeUrl: this.urlService.URLS.OWNER_KPI8,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI9,
      iconUrl: 'assets/icons/kpi/svg/owner/3.svg',
    }),
  ];

  totalOwnershipsRootKpi = new KpiRoot().clone<KpiRoot>({
    id: 10,
    arName: this.lang.getArabicTranslation('total_number_of_ownerships'),
    enName: this.lang.getEnglishTranslation('total_number_of_ownerships'),
    url: this.urlService.URLS.OWNER_KPI10,
    iconUrl: 'assets/icons/kpi/svg/owner/4.svg',
  });

  selectedRoot = this.rootKPIS[0];
  selectedPurpose = this.purposeKPIS[0];

  selectedTab: 'ownership_indicators' | 'statistical_reports_for_ownership' = 'ownership_indicators';

  NationalityCategories = NationalityCategories;
  selectedNationalityCategory = NationalityCategories.QATARI;
  isOnInitNationalitiesChart = true;
  isLoadingUpdatedNationalitiesData = false;
  selectedNationality = { id: 634, seriesIndex: 0, dataPointIndex: 0 };
  nationalitiesDataLength = 0;
  specialNationality = new Lookup().clone<Lookup>({ lookupKey: 82804, arName: 'أملاك دولة', enName: 'State property' });

  nationalitiesChartOptions: ChartOptionsModel = new ChartOptionsModel().clone<ChartOptionsModel>(
    this.appChartTypesService.mainChartOptions
  );

  isOnInitMunicipaliteisChart = true;
  isLoadingUpdatedMunicipalitiesData = false;
  selectedMunicipality = { id: 4, seriesIndex: 0, dataPointIndex: 0 };
  municipalitiesData: (KpiBaseModel & { municipalityId: number })[] = [];
  municipalitiesDataLength = 0;

  municipalitiesChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>(
    this.appChartTypesService.mainChartOptions
  );

  areasDataLength = 0;

  areasChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.mainChartOptions);

  ownerTypeSummaryDataLength = 0;
  ownerTypeSummaryChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>(
    this.appChartTypesService.mainChartOptions
  );

  durationRootData = {
    chartDataUrl: this.urlService.URLS[this._getChartDataUrl('OWNER_KPI12')],
    hasPrice: false,
  };

  ownerTypeRootData = {
    chartDataUrl: this.urlService.URLS[this._getChartDataUrl('OWNER_KPI15')],
    hasPrice: false,
  };

  ownerTypeLabel = (item: { ownerCategory: number }) =>
    this.lookupService.ownerOwnerCategoryMap[item.ownerCategory].getNames();

  ageCategoryRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI16,
    hasPrice: false,
  };

  ageCategoryLabel = (item: { ageCategory: number }) =>
    this.lookupService.ownerAgeCategoryMap[item.ageCategory].getNames();

  genderRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI18,
    hasPrice: false,
  };

  genderLabel = (item: { gender: number }) => this.lookupService.ownerGenderMap[item.gender]?.getNames() ?? '-';

  ageCategorySummaryRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI19,
    hasPrice: false,
  };

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this._initializeChartsFormatters();
    setTimeout(() => {
      this._listenToScreenSize();
      this.nationalityCriteria = { ...this.criteria.criteria, nationalityCode: this.selectedNationality.id };
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  switchTab(tab: 'ownership_indicators' | 'statistical_reports_for_ownership'): void {
    this.selectedTab = tab;
    if (this.selectedTab === 'ownership_indicators') {
      this.nationalitiesChart.setDirty();
      this.municipalitiesChart.setDirty();
      this.areasChart.setDirty();
    } else {
      this.ownerTypeSummaryChart.setDirty();
    }

    setTimeout(() => {
      if (this.selectedTab === 'ownership_indicators') {
        this.updateNationalitiesChartData(this.selectedNationalityCategory);
      } else {
        this.updateOwnerTypeSummaryChartData();
      }
    });

    setTimeout(() => {
      if (this.selectedTab === 'ownership_indicators') {
        this.nationalitiesChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
        this.municipalitiesChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
        this.areasChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
      } else {
        this.ownerTypeSummaryChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
      }
    }, 0);
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };

    this.rootKPIS.map((item) => {
      this.dashboardService
        .loadKpiRoot(item, this.criteria.criteria)
        .pipe(take(1))
        .subscribe((value) => {
          item.kpiData = value[0];
        });
    });

    this.dashboardService
      .loadKpiRoot(this.totalOwnershipsRootKpi, this.criteria.criteria)
      .pipe(take(1))
      .subscribe((value) => {
        this.totalOwnershipsRootKpi.kpiData = value[0];
      });

    this.rootItemSelected(this.selectedRoot);
    setTimeout(() => {
      if (this.selectedTab === 'ownership_indicators') {
        this.updateNationalitiesChartData(this.selectedNationalityCategory);
      } else {
        this.updateOwnerTypeSummaryChartData();
      }
    }, 0);
  }

  rootItemSelected(item?: KpiRoot) {
    if (!item) return;
    this.selectedRoot = item;
    this.rootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.dashboardService
      .loadPurposeKpi(item, this.criteria.criteria)
      .pipe(take(1))
      .subscribe((data) => {
        const _purposeKpiData = data.reduce((acc, item) => {
          return { ...acc, [item.purposeId]: item };
        }, {} as Record<number, KpiBaseModel>);

        this.purposeKPIS.forEach((item) => item.kpiData.resetAllValues());
        this.selectedRoot && this.updateAllPurpose();
        this.purposeKPIS.forEach((item) => {
          Object.prototype.hasOwnProperty.call(_purposeKpiData, item.id) && (item.kpiData = _purposeKpiData[item.id]);
        });
        this.selectedPurpose && this.purposeSelected(this.selectedPurpose);
      });
  }

  updateAllPurpose(): void {
    const _purpose = this.purposeKPIS.find((i) => i.id === -1);
    _purpose && (_purpose.kpiData = KpiBase.kpiFactory(this.selectedRoot.hasSqUnit).clone(this.selectedRoot.kpiData));
  }

  purposeSelected(item: KpiPurpose) {
    this.purposeKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.selectedPurpose = item;

    this.selectedRoot &&
      this.dashboardService
        .loadPropertyTypeKpi(this.selectedRoot, {
          ...this.criteria.criteria,
          purposeList: [item.id],
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          this.propertiesKPIS.forEach((item) => item.kpiData.resetAllValues());
          this.updateAllPropertyType();
          this.propertiesKPIS = this.propertiesKPIS
            .map((item) => {
              const _propertyTypeKpiData = result.find((i) => i.propertyTypeId === item.id);
              _propertyTypeKpiData && (item.kpiData = _propertyTypeKpiData);
              return item;
            })
            .sort((a, b) => a.kpiData.getKpiVal() - b.kpiData.getKpiVal());
        });
  }

  updateAllPropertyType(): void {
    const _propertyType = this.propertiesKPIS.find((i) => i.id === -1);
    _propertyType &&
      (_propertyType.kpiData = KpiBase.kpiFactory(this.selectedRoot.hasSqUnit).clone(this.selectedPurpose.kpiData));
  }

  updateNationalitiesChartData(nationalityCategory: NationalityCategories) {
    if (!this.nationalitiesChart?.length) return;
    this.isLoadingUpdatedNationalitiesData = true;
    this.selectedNationalityCategory = nationalityCategory;
    const _criteria = { ...this.criteria.criteria } as OwnerCriteriaContract;
    delete (_criteria as any).nationalityCode;

    this.dashboardService
      .loadOwnershipsCountNationality(_criteria, nationalityCategory)
      .pipe(take(1))
      .subscribe((data) => {
        const _minMaxAvg = minMaxAvg(data.map((item) => item.kpiVal));
        this.nationalitiesDataLength = data.length;
        data.sort((a, b) => a.kpiVal - b.kpiVal);
        this.nationalitiesChart.first
          ?.updateOptions({
            series: [
              {
                name: this.lang.map.ownerships_count,
                data: data.map((item, index) => ({
                  x: this.getNationalityNames(item.nationalityId),
                  y: item.kpiVal,
                  id: item.nationalityId,
                  index,
                })),
              },
            ],
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              BarChartTypes.SINGLE_BAR,
              this.nationalitiesDataLength
            ),
          })
          .then();
      });
  }

  updateMunicipalitiesChartData() {
    this.isLoadingUpdatedMunicipalitiesData = true;
    const _criteria = {
      ...this.criteria.criteria,
      nationalityCode: this.selectedNationality.id,
    } as OwnerCriteriaContract;
    delete (_criteria as any).municipalityId;
    this.dashboardService
      .loadChartKpiData(
        {
          chartDataUrl:
            this.selectedNationality.id === this.specialNationality.lookupKey
              ? this.urlService.URLS.OWNER_KPI13_1
              : this.urlService.URLS.OWNER_KPI13,
        },
        _criteria
      )
      .pipe(take(1))
      .pipe(map((data) => data as unknown as (KpiBaseModel & { municipalityId: number })[]))
      .subscribe((data) => {
        data.sort((a, b) => a.getKpiVal() - b.getKpiVal());
        this.municipalitiesData = data;
        this.municipalitiesDataLength = data.length;

        this.updateMunicipalitiesBarChartData();
      });
  }

  updateMunicipalitiesBarChartData() {
    const _minMaxAvg = minMaxAvg(this.municipalitiesData.map((item) => item.getKpiVal()));

    this.municipalitiesChart.first
      ?.updateOptions({
        series: [
          {
            name: this.lang.map.ownerships_count,
            data: this.municipalitiesData.map((item, index) => ({
              x: this.lookupService.ownerMunicipalitiesMap[item.municipalityId]?.getNames() ?? '',
              y: item.getKpiVal(),
              id: item.municipalityId,
              index,
            })),
          },
        ],
        colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
        ...this.appChartTypesService.getRangeOptions(
          this.screenSize,
          BarChartTypes.SINGLE_BAR,
          this.municipalitiesDataLength
        ),
      })
      .then();
  }

  onMapSelectedMunicipalityChanged(event: KpiBaseModel & { municipalityId: number }) {
    this.selectedMunicipality.id = event.municipalityId;
    this.selectedMunicipality.dataPointIndex = this.municipalitiesData.findIndex(
      (m) => m.municipalityId === event.municipalityId
    );

    this.isLoadingUpdatedMunicipalitiesData = true;
    this.municipalitiesChart.first?.toggleDataPointSelection(0, this.selectedMunicipality.dataPointIndex);
  }

  updateAreasChartData() {
    const _criteria = {
      ...this.criteria.criteria,
      nationalityCode: this.selectedNationality.id,
      municipalityId: this.selectedMunicipality.id,
    } as OwnerCriteriaContract;
    delete (_criteria as any).areaCode;
    this.dashboardService
      .loadChartKpiData(
        {
          chartDataUrl:
            this.selectedNationality.id === this.specialNationality.lookupKey
              ? this.urlService.URLS.OWNER_KPI14_1
              : this.urlService.URLS.OWNER_KPI14,
        },
        _criteria
      )
      .pipe(take(1))
      .pipe(map((data) => data as unknown as (KpiBaseModel & { areaCode: number })[]))
      .subscribe((data) => {
        data.sort((a, b) => a.getKpiVal() - b.getKpiVal());
        const _minMaxAvg = minMaxAvg(data.map((item) => item.getKpiVal()));
        this.areasDataLength = data.length;

        this.areasChart.first
          ?.updateOptions({
            series: [
              {
                name: this.lang.map.ownerships_count,
                data: data.map((item, index) => ({
                  x: this.lookupService.ownerDistrictMap[item.areaCode]?.getNames() ?? '',
                  y: item.getKpiVal(),
                  id: item.areaCode,
                  index,
                })),
              },
            ],
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              BarChartTypes.SINGLE_BAR,
              this.areasDataLength
            ),
          })
          .then();
      });
  }

  updateOwnerTypeSummaryChartData() {
    const _criteria = { ...this.criteria.criteria };
    delete (_criteria as any).ownerCategoryCode;

    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.urlService.URLS.OWNER_KPI20 }, _criteria)
      .pipe(take(1))
      .pipe(map((data) => data as unknown as { kpiVal: number; ownerCategory: number }[]))
      .subscribe((data) => {
        const _minMaxAvg = minMaxAvg(data.map((item) => item.kpiVal));
        this.ownerTypeSummaryDataLength = data.length;

        this.ownerTypeSummaryChart.first
          ?.updateOptions({
            series: [
              {
                name: this.lang.map.ownerships_count,
                data: data.map((item, index) => ({
                  x: this.lookupService.ownerOwnerCategoryMap[item.ownerCategory]?.getNames() || '',
                  y: item.kpiVal,
                  id: item.ownerCategory,
                  index,
                })),
              },
            ],
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],

            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              BarChartTypes.SINGLE_BAR,
              this.ownerTypeSummaryDataLength
            ),
          })
          .then();
      });
  }

  private _getChartDataUrl(baseUrl: keyof typeof this.urlService.URLS): keyof typeof this.urlService.URLS {
    if (this.selectedNationality.id === this.specialNationality.lookupKey)
      return (baseUrl + '_1') as keyof typeof this.urlService.URLS;

    return baseUrl;
  }

  private _initializeChartsFormatters() {
    this.nationalitiesChartOptions
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, { hasPrice: false })
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, { hasPrice: false }))
      .addUpdatedCallback(this._onNationalitiesChartUpdated)
      .addDataPointSelectionCallback(this._onNationalitiesChartDataPointSelection)
      .addCustomToolbarOptions();

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

    this.ownerTypeSummaryChartOptions
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, { hasPrice: false })
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, { hasPrice: false }))
      .addCustomToolbarOptions();

    setTimeout(() => {
      if (this.selectedTab === 'ownership_indicators') {
        this.nationalitiesChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
        this.municipalitiesChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
        this.areasChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
      } else {
        this.ownerTypeSummaryChart.first?.updateOptions({ chart: { type: 'bar' } }).then();
      }
    }, 0);
  }

  private _onNationalitiesChartUpdated = (chartContext: ChartContext, config: ChartConfig) => {
    const hasData = (config.config.series?.[0]?.data as { x: number; y: number; id: number }[] | undefined)?.filter(
      (item) => item.id
    ).length;
    if (!hasData) {
      return;
    }
    if (this.isOnInitNationalitiesChart) {
      this.nationalitiesChart.first?.toggleDataPointSelection(
        0,
        (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).filter(
          (item) => item.id === this.selectedNationality.id
        )[0].index
      );
    } else {
      if (!this.isLoadingUpdatedNationalitiesData) return;
      if (this.selectedNationality.dataPointIndex < (chartContext.w.config.series[0].data as unknown[]).length) {
        this.nationalitiesChart.first?.toggleDataPointSelection(
          this.selectedNationality.seriesIndex,
          this.selectedNationality.dataPointIndex
        );
      }
      this.nationalitiesChart.first?.toggleDataPointSelection(
        0,
        (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).length - 1
      );
    }
  };

  private _onNationalitiesChartDataPointSelection = (
    event: MouseEvent,
    chartContext: ChartContext,
    config: DataPointSelectionConfig
  ) => {
    if (config.selectedDataPoints[config.seriesIndex].length === 0) return;
    if (!event && !this.isOnInitNationalitiesChart && !this.isLoadingUpdatedNationalitiesData) return;
    this.isOnInitNationalitiesChart = false;
    this.isLoadingUpdatedNationalitiesData = false;
    this.selectedNationality = {
      id: (chartContext.w.config.series[config.seriesIndex].data[config.dataPointIndex] as unknown as { id: number })
        .id,
      seriesIndex: config.seriesIndex,
      dataPointIndex: config.dataPointIndex,
    };

    this.nationalitiesChart.first?.clearAnnotations();
    this.nationalitiesChart.first?.addXaxisAnnotation(
      this.appChartTypesService.getXAnnotaionForSelectedBar(this.getNationalityNames(this.selectedNationality.id)),
      true
    );

    this.durationRootData.chartDataUrl = this.urlService.URLS[this._getChartDataUrl('OWNER_KPI12')];
    this.ownerTypeRootData.chartDataUrl = this.urlService.URLS[this._getChartDataUrl('OWNER_KPI15')];
    this.nationalityCriteria = { ...this.criteria.criteria, nationalityCode: this.selectedNationality.id };

    this.updateMunicipalitiesChartData();
  };

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
    const _municipalityName = this.lookupService.ownerMunicipalitiesMap[this.selectedMunicipality.id].getNames();
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

      if (this.selectedTab === 'ownership_indicators') {
        this.nationalitiesChart.first?.updateOptions(
          this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.nationalitiesDataLength)
        );
        this.municipalitiesChart.first?.updateOptions(
          this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.municipalitiesDataLength)
        );
        this.areasChart.first?.updateOptions(
          this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.areasDataLength)
        );
      } else {
        this.ownerTypeSummaryChart.first?.updateOptions(
          this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.ownerTypeSummaryDataLength)
        );
      }
    });
  }

  getNationalityNames(nationalityId: number) {
    return nationalityId === this.specialNationality.lookupKey
      ? this.specialNationality.getNames()
      : this.lookupService.ownerNationalityMap[nationalityId]?.getNames() || '';
  }
  getStringSelectedCriteria(): string {
    return this.sectionTitle.getSelectedCriteria('owner', this.criteria.criteria, false, true, false);
  }
}
