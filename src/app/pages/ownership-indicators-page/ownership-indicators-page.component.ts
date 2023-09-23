import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PropertyBlockComponent } from '@components/property-block/property-block.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { OwnerCriteriaContract } from '@contracts/owner-criteria-contract';
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { ChartType } from '@enums/chart-type';
import { CriteriaType } from '@enums/criteria-type';
import { DurationEndpoints } from '@enums/durations';
import { NationalityCategories } from '@enums/nationality-categories';
import { ChartConfig, ChartContext, ChartOptionsModel, DataPointSelectionConfig } from '@models/chart-options-model';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { ScreenBreakpointsService } from '@services/screen-breakpoints.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { UrlService } from '@services/url.service';
import { minMaxAvg } from '@utils/utils';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel2';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';
import { Subject, map, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-owner-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    KpiRootComponent,
    PurposeComponent,
    IvyCarouselModule,
    PropertyBlockComponent,
    ButtonComponent,
    IconButtonComponent,
    NgApexchartsModule,
    FormatNumbersPipe,
    YoyIndicatorComponent,
    NgxMaskPipe,
    MatNativeDateModule,
  ],
  templateUrl: './ownership-indicators-page.component.html',
  styleUrls: ['./ownership-indicators-page.component.scss'],
})
export default class OwnershipIndicatorsPageComponent implements OnInit, AfterViewInit {
  @ViewChildren('carousel') carousel!: QueryList<CarouselComponent>;
  @ViewChildren('nationalitiesChart') nationalitiesChart!: QueryList<ChartComponent>;
  @ViewChildren('durationsChart') durationsChart!: QueryList<ChartComponent>;
  @ViewChildren('municipalitiesChart') municipalitiesChart!: QueryList<ChartComponent>;
  @ViewChildren('areasChart') areasChart!: QueryList<ChartComponent>;
  @ViewChildren('ownerTypeChart') ownerTypeChart!: QueryList<ChartComponent>;
  @ViewChildren('ageCategoryChart') ageCategoryChart!: QueryList<ChartComponent>;
  @ViewChildren('genderChart') genderChart!: QueryList<ChartComponent>;
  @ViewChildren('ageCategorySummaryChart') ageCategorySummaryChart!: QueryList<ChartComponent>;
  @ViewChildren('ownerTypeSummaryChart') ownerTypeSummaryChart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  appChartTypesService = inject(AppChartTypesService);
  adapter = inject(DateAdapter);
  screenService = inject(ScreenBreakpointsService);

  screenSize = Breakpoints.LG;

  destroy$ = new Subject<void>();

  municipalities = this.lookupService.ownerLookups.municipalityList;
  propertyTypes = this.lookupService.ownerLookups.propertyTypeList;
  propertyUsages = this.lookupService.ownerLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.ownerLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  nationalities = this.lookupService.ownerLookups.nationalityList;
  ownerTypes = this.lookupService.ownerLookups.ownerCategoryList;

  purposeKPIS = this.lookupService.ownerLookups.rentPurposeList;
  propertiesKPIS = this.lookupService.ownerLookups.propertyTypeList;

  minMaxArea: Partial<MinMaxAvgContract> = {};

  enableChangeAreaMinMaxValues = true;

  criteria!: {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  protected readonly DurationTypes = DurationEndpoints;
  protected readonly ChartType = ChartType;

  rootKPIS = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('total_number_of_properties_units'),
      this.lang.getEnglishTranslation('total_number_of_properties_units'),
      false,
      this.urlService.URLS.OWNER_KPI1,
      this.urlService.URLS.OWNER_KPI2,
      this.urlService.URLS.OWNER_KPI3,
      '',
      'assets/icons/kpi/2.png'
    ),
    new KpiRoot(
      4,
      this.lang.getArabicTranslation('total_number_of_qatari_owners'),
      this.lang.getEnglishTranslation('total_number_of_qatari_owners'),
      false,
      this.urlService.URLS.OWNER_KPI4,
      this.urlService.URLS.OWNER_KPI5,
      this.urlService.URLS.OWNER_KPI6,
      '',
      'assets/icons/kpi/4.png'
    ),

    new KpiRoot(
      7,
      this.lang.getArabicTranslation('total_number_of_non_qatari_owners'),
      this.lang.getEnglishTranslation('total_number_of_non_qatari_owners'),
      false,
      this.urlService.URLS.OWNER_KPI7,
      this.urlService.URLS.OWNER_KPI8,
      this.urlService.URLS.OWNER_KPI9,
      '',
      'assets/icons/kpi/8.png'
    ),
  ];

  totalOwnershipsRootKpi = new KpiRoot(
    10,
    this.lang.getArabicTranslation('total_number_of_ownerships'),
    this.lang.getEnglishTranslation('total_number_of_ownerships'),
    false,
    this.urlService.URLS.OWNER_KPI10,
    '',
    '',
    '',
    'assets/icons/kpi/7.png'
  );

  selectedRoot?: KpiRoot;
  selectedPurpose?: Lookup = this.lookupService.ownerLookups.rentPurposeList[0];

  selectedTab: 'ownership_indicators' | 'statistical_reports_for_ownership' = 'ownership_indicators';

  NationalityCategories = NationalityCategories;
  selectedNationalityCategory = NationalityCategories.QATARI;
  isOnInitNationalitiesChart = true;
  selectedNationalityId = 634;
  nationalitiesDataLength = 0;

  nationalitiesChartOptions: ChartOptionsModel = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
    ...this.appChartTypesService.yearlyStaticChartOptions,
  });

  selectedDurationType = DurationEndpoints.YEARLY;
  selectedDurationsChartType: ChartType = ChartType.LINE;
  durationsDataLength = 0;
  selectedDurationsBarChartType = BarChartTypes.SINGLE_BAR;

  durationsChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
  });

  isOnInitMunicipaliteisChart = true;
  selectedMunicipalityId = 4;
  municipalitiesDataLength = 0;

  municipalitiesChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
    ...this.appChartTypesService.yearlyStaticChartOptions,
  });

  areasDataLength = 0;

  areasChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
    ...this.appChartTypesService.yearlyStaticChartOptions,
  });

  ownerTypeChartOptions = this.appChartTypesService.pieChartOptions;

  ageCategoryChartOptions = this.appChartTypesService.pieChartOptions;

  genderChartOptions = this.appChartTypesService.pieChartOptions;

  ageCategorySummaryChartOptions = this.appChartTypesService.pieChartOptions;

  ownerTypeSummaryDataLength = 0;
  ownerTypeSummaryChartOptions = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
    ...this.appChartTypesService.yearlyStaticChartOptions,
  });

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this._initializeChartsFormatters();
    setTimeout(() => {
      this._listenToScreenSize();
    }, 0);
  }

  switchTab(tab: 'ownership_indicators' | 'statistical_reports_for_ownership'): void {
    this.selectedTab = tab;
    if (this.selectedTab === 'ownership_indicators') {
      this.carousel.setDirty();
      this.nationalitiesChart.setDirty();
      this.durationsChart.setDirty();
      this.municipalitiesChart.setDirty();
      this.areasChart.setDirty();
      this.ownerTypeChart.setDirty();
      this.ageCategoryChart.setDirty();
    } else {
      this.genderChart.setDirty();
      this.ageCategorySummaryChart.setDirty();
      this.ownerTypeSummaryChart.setDirty();
    }

    setTimeout(() => {
      if (this.selectedTab === 'ownership_indicators') {
        this.updateNationalitiesChartData(this.selectedNationalityCategory);
        this.updateDurationsChartData(this.selectedDurationType);
        this.updateMunicipalitiesChartData();
        this.updateAreasChartData();
        this.updateOwnerTypeChartData();
        this.updateAgeCategoryChartData();
      } else {
        this.updateGenderChartData();
        this.updateAgeCategorySummaryChartData();
        this.updateOwnerTypeSummaryChartData();
      }
    });

    setTimeout(() => {
      if (this.selectedTab === 'ownership_indicators') {
        this.nationalitiesChart.first.updateOptions({ chart: { type: 'bar' } }).then();
        this.durationsChart.first.updateOptions({ chart: { type: 'bar' } }).then();
        this.municipalitiesChart.first.updateOptions({ chart: { type: 'bar' } }).then();
        this.areasChart.first.updateOptions({ chart: { type: 'bar' } }).then();
      } else {
        this.ownerTypeSummaryChart.first.updateOptions({ chart: { type: 'bar' } }).then();
      }
    }, 0);
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };
    if (type === CriteriaType.DEFAULT) this.rootItemSelected(this.rootKPIS[0]);
    this.rootKPIS.map((item) => {
      this.dashboardService
        .loadKpiRoot(item, this.criteria.criteria)
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

    this.dashboardService
      .loadKpiRoot(this.totalOwnershipsRootKpi, this.criteria.criteria)
      .pipe(take(1))
      .subscribe((value) => {
        if (!value.length) {
          this.totalOwnershipsRootKpi.setValue(0);
          this.totalOwnershipsRootKpi.setYoy(0);
        } else {
          this.totalOwnershipsRootKpi.setValue(value[value.length - 1].kpiVal);
          this.totalOwnershipsRootKpi.setYoy(value[value.length - 1].kpiYoYVal);
        }
      });

    this.rootItemSelected(this.selectedRoot);
    setTimeout(() => {
      if (this.selectedTab === 'ownership_indicators') {
        this.updateNationalitiesChartData(this.selectedNationalityCategory);
        this.updateDurationsChartData(this.selectedDurationType);
        this.updateMunicipalitiesChartData();
        this.updateAreasChartData();
        this.updateOwnerTypeChartData();
        this.updateAgeCategoryChartData();
      } else {
        this.updateGenderChartData();
        this.updateAgeCategorySummaryChartData();
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

    this.dashboardService.loadPurposeKpi(item, this.criteria.criteria).subscribe((subKPI) => {
      const purpose = subKPI.reduce((acc, item) => {
        return { ...acc, [item.purposeId]: item };
      }, {} as Record<number, KpiModel>);

      this.purposeKPIS = this.purposeKPIS.map((item) => {
        Object.prototype.hasOwnProperty.call(purpose, item.lookupKey)
          ? (item.value = purpose[item.lookupKey].kpiVal)
          : (item.value = 0);
        Object.prototype.hasOwnProperty.call(purpose, item.lookupKey)
          ? (item.yoy = purpose[item.lookupKey].kpiYoYVal)
          : (item.yoy = 0);
        return item;
      });
      this.selectedRoot && this.updateAllPurpose(this.selectedRoot.value, this.selectedRoot.yoy);
      this.selectedPurpose && this.purposeSelected(this.selectedPurpose);
    });
  }

  updateAllPurpose(value: number, yoy: number): void {
    const lookup = this.purposeKPIS.find((i) => i.lookupKey === -1);
    lookup && (lookup.value = value) && (lookup.yoy = yoy);
  }

  purposeSelected(item: Lookup) {
    this.purposeKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.selectedPurpose = item;

    this.selectedRoot &&
      this.dashboardService
        .loadPropertyTypeKpi(this.selectedRoot, {
          ...this.criteria.criteria,
          purposeList: [item.lookupKey],
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          this.propertiesKPIS = this.propertiesKPIS
            .map((item) => {
              const subItem = result.find((i) => i.propertyTypeId === item.lookupKey);
              subItem ? (item.value = subItem.kpiVal) : (item.value = 0);
              subItem ? (item.yoy = subItem.kpiYoYVal) : (item.yoy = 0);
              return item;
            })
            .sort((a, b) => a.value - b.value);
          this.goToFirstCell();
        });
  }

  private goToFirstCell(): void {
    if (!this.carousel.length) return;
    this.carousel.first.cellsToScroll = this.carousel.first.cellLength;
    this.carousel.first.next();
    this.carousel.first.cellsToScroll = 1;
  }

  updateNationalitiesChartData(nationalityCategory: NationalityCategories) {
    if (!this.nationalitiesChart?.length) return;
    this.selectedNationalityCategory = nationalityCategory;
    const _criteria = { ...this.criteria.criteria } as OwnerCriteriaContract;
    delete (_criteria as any).nationalityCode;

    this.dashboardService
      .loadOwnershipsCountNationality(_criteria, nationalityCategory)
      .pipe(take(1))
      .subscribe((data) => {
        const _minMaxAvg = minMaxAvg(data.map((item) => item.kpiVal));
        this.nationalitiesDataLength = data.length;
        this.nationalitiesChart.first
          .updateOptions({
            series: [
              {
                name: this.lang.map.ownerships_count,
                data: data.map((item, index) => ({
                  x: (item.nationalityInfo && item.nationalityInfo.getNames()) || '',
                  y: item.kpiVal,
                  id: item.nationalityId,
                  index,
                })),
              },
            ],
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
            ...this.appChartTypesService.yearlyStaticChartOptions,
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              BarChartTypes.SINGLE_BAR,
              this.nationalitiesDataLength
            ),
          })
          .then();
      });
  }

  updateDurationsChartData(durationType: DurationEndpoints) {
    if (!this.durationsChart.length) return;
    this.selectedDurationType = durationType;
    const _criteria = {
      ...this.criteria.criteria,
      nationalityCode: this.selectedNationalityId,
    } as OwnerCriteriaContract;

    if (this.selectedDurationType === DurationEndpoints.YEARLY) {
      this.updateDurationsChartDataYearly(_criteria);
      this.selectedDurationsBarChartType = BarChartTypes.SINGLE_BAR;
    } else if (this.selectedDurationType === DurationEndpoints.MONTHLY) {
      this.updateDurationsChartDataMonthly(_criteria);
      this.selectedDurationsBarChartType = BarChartTypes.SINGLE_BAR;
    } else if (this.selectedDurationType === DurationEndpoints.HALFY) {
      this.updateDurationsChartDataHalfyOrQuarterly(_criteria);
      this.selectedDurationsBarChartType = BarChartTypes.DOUBLE_BAR;
    } else {
      this.updateDurationsChartDataHalfyOrQuarterly(_criteria);
      this.selectedDurationsBarChartType = BarChartTypes.QUAD_BAR;
    }
  }

  updateDurationsChartDataYearly(criteria: OwnerCriteriaContract) {
    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.urlService.URLS.OWNER_KPI12 }, criteria)
      .pipe(take(1))
      .subscribe((data) => {
        const _minMaxAvg = minMaxAvg(data.map((item) => item.kpiVal));
        this.durationsDataLength = data.length;

        this.durationsChart.first
          .updateOptions({
            series: [
              {
                name: this.lang.map.ownerships_count,
                data: data.map((item) => ({ y: item.kpiVal, x: item.issueYear })),
              },
            ],
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
            ...this.appChartTypesService.yearlyStaticChartOptions,
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              this.selectedDurationsBarChartType,
              this.durationsDataLength
            ),
          })
          .then();
      });
  }

  updateDurationsChartDataMonthly(criteria: OwnerCriteriaContract) {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const months = this.adapter.getMonthNames('long');
    this.dashboardService
      .loadChartKpiDataForDuration(
        DurationEndpoints.MONTHLY,
        { chartDataUrl: this.urlService.URLS.OWNER_KPI12 },
        criteria
      )
      .pipe(take(1))
      .subscribe((data) => {
        data.sort((a, b) => a.issuePeriod - b.issuePeriod);
        const _minMaxAvg = minMaxAvg(data.map((d) => d.kpiVal));
        this.durationsDataLength = data.length;

        this.durationsChart.first
          .updateOptions({
            series: [
              {
                name: this.lang.map.ownerships_count,
                data: data.map((item) => {
                  return {
                    y: item.kpiVal,
                    x: months[item.issuePeriod - 1],
                  };
                }),
              },
            ],
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
            ...this.appChartTypesService.monthlyStaticChartOptions,
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              this.selectedDurationsBarChartType,
              this.durationsDataLength
            ),
          })
          .then();
      });
  }

  updateDurationsChartDataHalfyOrQuarterly(criteria: OwnerCriteriaContract) {
    this.dashboardService
      .loadChartKpiDataForDuration(
        this.selectedDurationType === DurationEndpoints.HALFY ? DurationEndpoints.HALFY : DurationEndpoints.QUARTERLY,
        { chartDataUrl: this.urlService.URLS.OWNER_KPI12 },
        criteria
      )
      .pipe(take(1))
      .pipe(
        map((durationData) => {
          return this.dashboardService.mapDurationData(
            durationData,
            this.selectedDurationType === DurationEndpoints.HALFY
              ? this.lookupService.ownerLookups.halfYearDurations
              : this.lookupService.ownerLookups.quarterYearDurations
          );
        })
      )
      .subscribe((data) => {
        const _chartData = Object.keys(data).map((key) => ({
          name: data[key as unknown as number].period.getNames(),
          data: data[key as unknown as number].kpiValues.map((item) => ({ y: item.value, x: item.year })),
        }));
        this.durationsDataLength = data[1].kpiValues.length;

        this.durationsChart.first
          .updateOptions({
            series: _chartData,

            ...this.appChartTypesService.halflyAndQuarterlyStaticChartOptions,
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              this.selectedDurationsBarChartType,
              this.durationsDataLength
            ),
          })
          .then();
      });
  }

  updateMunicipalitiesChartData() {
    const _criteria = {
      ...this.criteria.criteria,
      nationalityCode: this.selectedNationalityId,
    } as OwnerCriteriaContract;
    delete (_criteria as any).municipalityId;
    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.urlService.URLS.OWNER_KPI13 }, _criteria)
      .pipe(take(1))
      .pipe(map((data) => data as unknown as (KpiModel & { municipalityId: number })[]))
      .subscribe((data) => {
        const _minMaxAvg = minMaxAvg(data.map((item) => item.kpiVal));
        this.municipalitiesDataLength = data.length;

        this.municipalitiesChart.first
          .updateOptions({
            series: [
              {
                name: this.lang.map.ownerships_count,
                data: data.map((item, index) => ({
                  x: this.lookupService.ownerMunicipalitiesMap[item.municipalityId].getNames() || '',
                  y: item.kpiVal,
                  id: item.municipalityId,
                  index,
                })),
              },
            ],
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
            ...this.appChartTypesService.yearlyStaticChartOptions,
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              BarChartTypes.SINGLE_BAR,
              this.municipalitiesDataLength
            ),
          })
          .then();
      });
  }

  updateAreasChartData() {
    const _criteria = {
      ...this.criteria.criteria,
      nationalityCode: this.selectedNationalityId,
      municipalityId: this.selectedMunicipalityId,
    } as OwnerCriteriaContract;
    delete (_criteria as any).areaCode;
    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.urlService.URLS.OWNER_KPI14 }, _criteria)
      .pipe(take(1))
      .pipe(map((data) => data as unknown as (KpiModel & { areaCode: number })[]))
      .subscribe((data) => {
        const _minMaxAvg = minMaxAvg(data.map((item) => item.kpiVal));
        this.areasDataLength = data.length;

        this.areasChart.first
          .updateOptions({
            series: [
              {
                name: this.lang.map.ownerships_count,
                data: data.map((item, index) => ({
                  x: this.lookupService.ownerDistrictMap[item.areaCode].getNames() || '',
                  y: item.kpiVal,
                  id: item.areaCode,
                  index,
                })),
              },
            ],
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
            ...this.appChartTypesService.yearlyStaticChartOptions,
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              BarChartTypes.SINGLE_BAR,
              this.areasDataLength
            ),
          })
          .then();
      });
  }

  updateOwnerTypeChartData(): void {
    if (!this.ageCategoryChart.length) return;

    const _criteria = {
      ...this.criteria.criteria,
      nationalityCode: this.selectedNationalityId,
    } as OwnerCriteriaContract;
    delete (_criteria as any).ownerCategoryCode;

    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.urlService.URLS.OWNER_KPI15 }, _criteria)
      .pipe(take(1))
      .pipe(map((data) => data as unknown as (KpiModel & { ownerCategory: number })[]))
      .subscribe((data) => {
        this.ownerTypeChart.first
          .updateOptions({
            series: data.map((item) => item.kpiVal),
            labels: data.map((item) => this.lookupService.ownerOwnerCategoryMap[item.ownerCategory].getNames()),
          })
          .then();
      });
  }

  updateAgeCategoryChartData(): void {
    if (!this.ageCategoryChart.length) return;

    const _criteria = {
      ...this.criteria.criteria,
      nationalityCode: this.selectedNationalityId,
    } as OwnerCriteriaContract;

    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.urlService.URLS.OWNER_KPI16 }, _criteria)
      .pipe(take(1))
      .pipe(map((data) => data as unknown as (KpiModel & { ageCategory: number })[]))
      .subscribe((data) => {
        this.ageCategoryChart.first
          .updateOptions({
            series: data.map((item) => item.kpiVal),
            labels: data.map((item) => this.lookupService.ownerAgeCategoryMap[item.ageCategory].getNames()),
          })
          .then();
      });
  }

  updateGenderChartData(): void {
    if (!this.genderChart.length) return;

    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.urlService.URLS.OWNER_KPI18 }, this.criteria.criteria)
      .pipe(take(1))
      .pipe(map((data) => data as unknown as { kpiVal: number; gender: number }[]))
      .subscribe((data) => {
        this.genderChart.first
          .updateOptions({
            series: data.map((item) => item.kpiVal),
            labels: data.map((item) => this.lookupService.ownerGenderMap[item.gender]?.getNames() ?? '-'),
          })
          .then();
      });
  }

  updateAgeCategorySummaryChartData(): void {
    if (!this.ageCategorySummaryChart.length) return;

    this.dashboardService
      .loadChartKpiData({ chartDataUrl: this.urlService.URLS.OWNER_KPI19 }, this.criteria.criteria)
      .pipe(take(1))
      .pipe(map((data) => data as unknown as { kpiVal: number; ageCategory: number }[]))
      .subscribe((data) => {
        this.ageCategorySummaryChart.first
          .updateOptions({
            series: data.map((item) => item.kpiVal),
            labels: data.map((item) => this.lookupService.ownerAgeCategoryMap[item.ageCategory].getNames()),
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
          .updateOptions({
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
            ...this.appChartTypesService.yearlyStaticChartOptions,
            ...this.appChartTypesService.getRangeOptions(
              this.screenSize,
              BarChartTypes.SINGLE_BAR,
              this.ownerTypeSummaryDataLength
            ),
          })
          .then();
      });
  }

  get basedOnCriteria(): string {
    const generatedTitle: string[] = [];
    const municipality = this.getSelectedMunicipality();
    const district = this.getSelectedDistrict();
    const purpose = this.getSelectedPurpose();
    const propertyType = this.getSelectedPropertyType();
    municipality.length && generatedTitle.push(municipality);
    district.length && generatedTitle.push(district);
    propertyType.length && generatedTitle.push(propertyType);
    purpose.length && generatedTitle.push(purpose);
    return generatedTitle.length ? `(${generatedTitle.join(' , ')})` : '';
  }

  private getSelectedMunicipality(): string {
    if (this.criteria.criteria.municipalityId === -1) return '';
    return this.lookupService.ownerMunicipalitiesMap[this.criteria.criteria.municipalityId].getNames() || '';
  }

  private getSelectedDistrict(): string {
    const areaCode = (this.criteria.criteria as OwnerCriteriaContract).areaCode;
    if (areaCode === -1) return '';
    return this.lookupService.ownerDistrictMap[areaCode].getNames() || '';
  }

  private getSelectedPropertyType(): string {
    return this.criteria.criteria.propertyTypeList &&
      this.criteria.criteria.propertyTypeList.length == 1 &&
      this.criteria.criteria.propertyTypeList[0] !== -1
      ? this.lookupService.ownerPropertyTypeMap[this.criteria.criteria.propertyTypeList[0]].getNames()
      : '';
  }

  private getSelectedPurpose(): string {
    return this.criteria.criteria.purposeList &&
      this.criteria.criteria.purposeList.length == 1 &&
      this.criteria.criteria.purposeList[0] !== -1
      ? this.lookupService.ownerPurposeMap[this.criteria.criteria.purposeList[0]].getNames()
      : '';
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

    this.durationsChartOptions
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, { hasPrice: false })
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, { hasPrice: false }))
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
        this.nationalitiesChart.first.updateOptions({ chart: { type: 'bar' } }).then();
        this.durationsChart.first.updateOptions({ chart: { type: 'bar' } }).then();
        this.municipalitiesChart.first.updateOptions({ chart: { type: 'bar' } }).then();
        this.areasChart.first.updateOptions({ chart: { type: 'bar' } }).then();
      } else {
        this.ownerTypeSummaryChart.first.updateOptions({ chart: { type: 'bar' } }).then();
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
      this.nationalitiesChart.first.toggleDataPointSelection(
        0,
        (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).filter(
          (item) => item.id === this.selectedNationalityId
        )[0].index
      );
    }
  };

  private _onNationalitiesChartDataPointSelection = (
    event: MouseEvent,
    chartContext: ChartContext,
    config: DataPointSelectionConfig
  ) => {
    if (config.selectedDataPoints[config.seriesIndex].length === 0) return;
    if (this.isOnInitNationalitiesChart) this.isOnInitNationalitiesChart = false;
    this.selectedNationalityId = (
      chartContext.w.config.series[config.seriesIndex].data[config.dataPointIndex] as unknown as { id: number }
    ).id;
    this.updateDurationsChartData(this.selectedDurationType);
    this.updateMunicipalitiesChartData();
    this.updateOwnerTypeChartData();
    this.updateAgeCategoryChartData();
  };

  private _onMunicipalitiesChartUpdated = (chartContext: ChartContext, config: ChartConfig) => {
    const hasData = (config.config.series?.[0]?.data as { x: number; y: number; id: number }[] | undefined)?.filter(
      (item) => item.id
    ).length;
    if (!hasData) {
      return;
    }
    if (this.isOnInitMunicipaliteisChart) {
      this.municipalitiesChart.first.toggleDataPointSelection(
        0,
        (chartContext.w.config.series[0].data as unknown as { index: number; id: number }[]).filter(
          (item) => item.id === this.selectedMunicipalityId
        )[0].index
      );
    }
  };

  private _onMunicipalitiesChartDataPointSelection = (
    event: MouseEvent,
    chartContext: ChartContext,
    config: DataPointSelectionConfig
  ) => {
    if (config.selectedDataPoints[config.seriesIndex].length === 0) return;
    if (this.isOnInitMunicipaliteisChart) this.isOnInitMunicipaliteisChart = false;
    this.selectedMunicipalityId = (
      chartContext.w.config.series[config.seriesIndex].data[config.dataPointIndex] as unknown as { id: number }
    ).id;
    this.updateAreasChartData();
  };

  _listenToScreenSize() {
    this.screenService.screenSizeObserver$.pipe(takeUntil(this.destroy$)).subscribe((size) => {
      this.screenSize = size;
      if (this.selectedTab === 'ownership_indicators') {
        this.nationalitiesChart.first.updateOptions(
          this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.nationalitiesDataLength)
        );
        this.durationsChart.first.updateOptions(
          this.appChartTypesService.getRangeOptions(size, this.selectedDurationsBarChartType, this.durationsDataLength)
        );
        this.municipalitiesChart.first.updateOptions(
          this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.municipalitiesDataLength)
        );
        this.areasChart.first.updateOptions(
          this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.areasDataLength)
        );
      } else {
        this.ownerTypeSummaryChart.first.updateOptions(
          this.appChartTypesService.getRangeOptions(size, BarChartTypes.SINGLE_BAR, this.ownerTypeSummaryDataLength)
        );
      }
    });
  }
}
