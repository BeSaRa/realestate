import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CriteriaType } from '@enums/criteria-type';
import { KpiRoot } from '@models/kpi-root';

import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { MatNativeDateModule } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RentTransactionIndicator } from '@app-types/rent-indicators-type';
import { ButtonComponent } from '@components/button/button.component';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { ForecastingChartComponent } from '@components/forecasting-chart/forecasting-chart.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { PieChartComponent } from '@components/pie-chart/pie-chart.component';
import { PropertyCarouselComponent } from '@components/property-carousel/property-carousel.component';
import { TableComponent } from '@components/table/table.component';
import { TopTenChartComponent } from '@components/top-ten-chart/top-ten-chart.component';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { maskSeparator } from '@constants/mask-separator';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { indicatorsTypes } from '@enums/Indicators-type';
import { AppTableDataSource } from '@models/app-table-data-source';
import { RentCompositeTransaction } from '@models/composite-transaction';
import { CriteriaSpecificTerms, CriteriaTerms } from '@models/criteria-specific-terms';
import { KpiBase } from '@models/kpi-base';
import { KpiPropertyType } from '@models/kpi-property-type';
import { KpiPurpose } from '@models/kpi-purpose';
import { Lookup } from '@models/lookup';
import { RentTransaction } from '@models/rent-transaction';
import { RentTransactionPropertyType } from '@models/rent-transaction-property-type';
import { RentTransactionPurpose } from '@models/rent-transaction-purpose';
import { TableSortOption } from '@models/table-sort-option';
import { Top10AccordingTo } from '@models/top-10-according-to';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { SectionTitleService } from '@services/section-title.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { UrlService } from '@services/url.service';
import { NgxMaskPipe } from 'ngx-mask';
import {
  BehaviorSubject,
  combineLatest,
  delay,
  map,
  Observable,
  of,
  ReplaySubject,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';

@Component({
  selector: 'app-rental-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    KpiRootComponent,
    PurposeComponent,
    PropertyCarouselComponent,
    TableComponent,
    TableColumnTemplateDirective,
    TableColumnHeaderTemplateDirective,
    TableColumnCellTemplateDirective,
    IconButtonComponent,
    ButtonComponent,
    MatTableModule,
    MatSortModule,
    FormatNumbersPipe,
    YoyIndicatorComponent,
    NgxMaskPipe,
    MatNativeDateModule,
    DurationChartComponent,
    PieChartComponent,
    TopTenChartComponent,
    ForecastingChartComponent,
    CustomTooltipDirective,
  ],
  templateUrl: './rental-indicators-page.component.html',
  styleUrls: ['./rental-indicators-page.component.scss'],
})
export default class RentalIndicatorsPageComponent implements OnInit, OnDestroy {
  protected readonly IndicatorsType = indicatorsTypes;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  sectionTitle = inject(SectionTitleService);

  destroy$ = new Subject<void>();
  reload$ = new ReplaySubject<void>(1);
  private basedOn$ = new BehaviorSubject<indicatorsTypes>(indicatorsTypes.PURPOSE);

  municipalities = this.lookupService.rentLookups.municipalityList;
  propertyTypes = this.lookupService.rentLookups.propertyTypeList;
  propertyUsages = this.lookupService.rentLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  zones = this.lookupService.rentLookups.zoneList;
  rooms = this.lookupService.rentLookups.rooms;
  furnitureStatusList = this.lookupService.rentLookups.furnitureStatusList;
  paramsRange = this.lookupService.rentLookups.maxParams;
  nationalities = this.lookupService.ownerLookups.nationalityList;

  isMonthlyDuration = true;

  transactions$: Observable<RentTransaction[]> = this.loadTransactions();
  transactionsCount = 0;
  dataSource: AppTableDataSource<RentTransaction> = new AppTableDataSource(this.transactions$);

  transactionsStatistics$: Observable<RentTransactionIndicator[]> = this.setIndicatorsTableDataSource();
  transactionsStatisticsDatasource = new AppTableDataSource<RentTransactionIndicator>(this.transactionsStatistics$);
  transactionsSortOptions: TableSortOption[] = [
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('most_recent'),
      enName: this.lang.getEnglishTranslation('most_recent'),
      value: {
        column: 'startDate',
        direction: 'desc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('oldest'),
      enName: this.lang.getEnglishTranslation('oldest'),
      value: {
        column: 'startDate',
        direction: 'asc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('the_higher_price'),
      enName: this.lang.getEnglishTranslation('the_higher_price'),
      value: {
        column: 'rentPaymentMonthly',
        direction: 'desc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('the_lowest_price'),
      enName: this.lang.getEnglishTranslation('the_lowest_price'),
      value: {
        column: 'rentPaymentMonthly',
        direction: 'asc',
      },
    }),
  ];

  criteria = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  selectedIndicators = this.IndicatorsType.PURPOSE;

  private paginate$ = new BehaviorSubject({
    offset: 0,
    limit: 5,
  });
  rootKPIS = [
    new KpiRoot().clone<KpiRoot>({
      id: 1,
      arName: this.lang.getArabicTranslation('the_total_number_of_lease_contracts'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_lease_contracts'),
      url: this.urlService.URLS.RENT_KPI1,
      purposeUrl: this.urlService.URLS.RENT_KPI2,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI3,
      chartDataUrl: this.urlService.URLS.RENT_KPI19,
      iconUrl: 'assets/icons/kpi/svg/8.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 4,
      arName: this.lang.getArabicTranslation('the_total_number_of_properties_units_rented'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_properties_units_rented'),
      url: this.urlService.URLS.RENT_KPI4,
      purposeUrl: this.urlService.URLS.RENT_KPI5,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI6,
      chartDataUrl: this.urlService.URLS.RENT_KPI20,
      iconUrl: 'assets/icons/kpi/svg/1.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 10,
      arName: this.lang.getArabicTranslation('total_rented_space'),
      enName: this.lang.getEnglishTranslation('total_rented_space'),
      url: this.urlService.URLS.RENT_KPI10,
      purposeUrl: this.urlService.URLS.RENT_KPI11,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI12,
      chartDataUrl: this.urlService.URLS.RENT_KPI21,
      iconUrl: 'assets/icons/kpi/svg/5.svg',
      isDataAvailable: false,
      hasSqUnit: true,
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 7,
      arName: this.lang.getArabicTranslation('the_total_value_of_lease_contracts'),
      enName: this.lang.getEnglishTranslation('the_total_value_of_lease_contracts'),
      url: this.urlService.URLS.RENT_KPI7,
      purposeUrl: this.urlService.URLS.RENT_KPI8,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI9,
      chartDataUrl: this.urlService.URLS.RENT_KPI22,
      iconUrl: 'assets/icons/kpi/svg/4.svg',
      hasPrice: true,
    }),
    new KpiRoot([
      'zoneId',
      { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
      { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    ]).clone<KpiRoot>({
      id: 16,
      arName: this.lang.getArabicTranslation('rent_average_price_per'),
      enName: this.lang.getEnglishTranslation('rent_average_price_per'),
      url: this.urlService.URLS.RENT_KPI16,
      purposeUrl: this.urlService.URLS.RENT_KPI17,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI18,
      chartDataUrl: this.urlService.URLS.RENT_KPI24,
      iconUrl: 'assets/icons/kpi/svg/3.svg',
      hasPrice: true,
      isDataAvailable: false,
      hasSqUnit: true,
    }),
    new KpiRoot([
      'zoneId',
      { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
      { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    ]).clone<KpiRoot>({
      id: 13,
      arName: this.lang.getArabicTranslation('average_rental_price_per_unit_property'),
      enName: this.lang.getEnglishTranslation('average_rental_price_per_unit_property'),
      url: this.urlService.URLS.RENT_KPI13,
      purposeUrl: this.urlService.URLS.RENT_KPI14,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI15,
      chartDataUrl: this.urlService.URLS.RENT_KPI23,
      iconUrl: 'assets/icons/kpi/svg/2.svg',
      hasPrice: true,
    }),
  ];

  accordingToList: Top10AccordingTo[] = [
    new Top10AccordingTo().clone<Top10AccordingTo>({
      id: 0,
      arName: this.lang.getArabicTranslation('number_of_lease_contracts'),
      enName: this.lang.getEnglishTranslation('number_of_lease_contracts'),
      url: this.urlService.URLS.RENT_KPI30,
      hasPrice: false,
    }),
    new Top10AccordingTo().clone<Top10AccordingTo>({
      id: 1,
      arName: this.lang.getArabicTranslation('number_of_units'),
      enName: this.lang.getEnglishTranslation('number_of_units'),
      url: this.urlService.URLS.RENT_KPI30_1,
      hasPrice: false,
    }),
    new Top10AccordingTo([
      { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
      { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    ]).clone<Top10AccordingTo>({
      id: 2,
      arName: this.lang.getArabicTranslation('average_price_per_month'),
      enName: this.lang.getEnglishTranslation('average_price_per_month'),
      url: this.urlService.URLS.RENT_KPI31,
      hasPrice: true,
    }),
    new Top10AccordingTo([
      { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
      { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    ]).clone<Top10AccordingTo>({
      id: 3,
      arName: this.lang.getArabicTranslation('rent_average_price_per'),
      enName: this.lang.getEnglishTranslation('rent_average_price_per'),
      url: this.urlService.URLS.RENT_KPI31_1,
      hasPrice: true,
      hasSqUnit: true,
      disabled: true,
    }),
    new Top10AccordingTo().clone<Top10AccordingTo>({
      id: 4,
      arName: this.lang.getArabicTranslation('contracts_values'),
      enName: this.lang.getEnglishTranslation('contracts_values'),
      url: this.urlService.URLS.RENT_KPI32,
      hasPrice: true,
    }),
    new Top10AccordingTo().clone<Top10AccordingTo>({
      id: 5,
      arName: this.lang.getArabicTranslation('rented_spaces'),
      enName: this.lang.getEnglishTranslation('rented_spaces'),
      url: this.urlService.URLS.RENT_KPI33,
      hasPrice: false,
      hasSqUnit: true,
      disabled: true,
    }),
  ];

  top10Label = (item: { kpiVal: number; zoneId: number }) => this.lookupService.rentZonesMap[item.zoneId].getNames();

  purposeKPIS = this.lookupService.rentLookups.rentPurposeList.map((item) =>
    new KpiPurpose().clone<KpiPurpose>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );
  propertiesKPIS = this.lookupService.rentLookups.propertyTypeList.map((item) =>
    new KpiPropertyType().clone<KpiPropertyType>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );

  selectedRoot = this.rootKPIS[0];

  selectedPurpose = this.purposeKPIS[0];
  selectedTab: 'rental_indicators' | 'statistical_reports_for_rent' = 'rental_indicators';

  forecastCriteriaTerms = new CriteriaSpecificTerms([
    'municipalityId',
    'zoneId',
    { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL, mapTo: 'propertyTypeId' },
    { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL, mapTo: 'property_usage' },
    // temporarily commented until implemented from BE
    // 'streetNo',
    // 'bedRoomsCount'
  ]);

  protected readonly maskSeparator = maskSeparator;

  compositeTransactions: RentCompositeTransaction[][] = [];
  compositeYears!: { selectedYear: number; previousYear: number };
  compositeTransactionsColumns = [
    'municipality',
    'firstYear1',
    'firstYear2',
    'firstYoy',
    'secondYear1',
    'secondYear2',
    'secondYoy',
    'thirdYear1',
    'thirdYear2',
    'thirdYoy',
  ];
  compositeTransactionsExtraColumns = ['contractCounts', 'contractValues', 'avgContract'];

  compositeAvgRentCriteriaTerms = new CriteriaSpecificTerms([
    { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
  ]);

  transactionsStatisticsColumns = ['average', 'certificates-count', 'area', 'units-count', 'average-square', 'chart'];

  purposeTableCriteriaTerms = new CriteriaSpecificTerms([
    'zoneId',
    { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
  ]);
  propertyTypeTableCriteriaTerms = new CriteriaSpecificTerms([
    'zoneId',
    { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
  ]);

  get isPurposeOrTypeTermsValid() {
    return (
      (this.selectedIndicators === this.IndicatorsType.PURPOSE &&
        this.purposeTableCriteriaTerms.validate(this.criteria.criteria)) ||
      (this.selectedIndicators === this.IndicatorsType.TYPE &&
        this.propertyTypeTableCriteriaTerms.validate(this.criteria.criteria))
    );
  }

  get purposeOrTypeTermsText() {
    return this.selectedIndicators === this.IndicatorsType.PURPOSE
      ? this.purposeTableCriteriaTerms.getCriteriaTermsText()
      : this.propertyTypeTableCriteriaTerms.getCriteriaTermsText();
  }

  get priceList() {
    return this.rootKPIS.filter((item) => item.hasPrice);
  }

  get nonePriceList() {
    return this.rootKPIS.filter((item) => !item.hasPrice);
  }

  roomsRootData = {
    chartDataUrl: this.urlService.URLS.RENT_KPI34,
    hasPrice: false,
  };

  roomLabel = (item: { kpiVal: number; bedRoomsCount: number }) => {
    return (
      this.lookupService.rentRoomsMap[item.bedRoomsCount || 0]?.getNames() ||
      new Lookup()
        .clone<Lookup>({
          arName: ` غرف${item.bedRoomsCount || 'N/A'}`,
          enName: `${item.bedRoomsCount || 'N/A'} Rooms`,
        })
        .getNames()
    );
  };

  furnitureRootData = {
    chartDataUrl: this.urlService.URLS.RENT_KPI34_1,
    hasPrice: false,
  };

  furnitureLabel = (item: { kpiVal: number; furnitureStatus: number }) =>
    this.lookupService.rentFurnitureMap[item.furnitureStatus || 0]?.getNames();

  ngOnInit(): void {
    this.reload$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  protected setIndicatorsTableDataSource(): Observable<RentTransactionIndicator[]> {
    return of(undefined)
      .pipe(delay(0))
      .pipe(
        switchMap(() => {
          return combineLatest([this.reload$, this.basedOn$]).pipe(
            switchMap(([, basedOn]) => {
              this.transactionsStatisticsColumns.length === 7
                ? (this.transactionsStatisticsColumns[0] = basedOn)
                : this.transactionsStatisticsColumns.unshift(basedOn);
              this.selectedIndicators = basedOn;
              return basedOn === indicatorsTypes.PURPOSE
                ? // ToDO: since limit filter is not working (we rigestered an issue to be team for that)
                  // ToDo: applay pagination on table
                  // For now we take only five records
                  this.dashboardService.loadRentTransactionsBasedOnPurpose(this.criteria.criteria).pipe(
                    map((items) => {
                      return items.slice(0, 5);
                    })
                  )
                : this.dashboardService.loadRentTransactionsBasedOnPropertyType(this.criteria.criteria).pipe(
                    map((items) => {
                      return items.slice(0, 5);
                    })
                  );
            }),
            map((response) => {
              return response;
            })
          );
        })
      );
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria: { ...criteria, limit: 5 }, type };

    this.rootKPIS.map((item) => {
      this.dashboardService
        .loadKpiRoot(item, this.criteria.criteria)
        .pipe(take(1))
        .subscribe((value) => {
          item.kpiData = value[0];
        });
    });

    this.rootItemSelected(this.selectedRoot);

    this.reload$.next();
    this.loadCompositeTransactions();
    this.setIndicatorsTableDataSource();
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

          this.propertiesKPIS = this.propertiesKPIS
            .map((item) => {
              const _propertyTypeKpiData = result.find((i) => i.propertyTypeId === item.id);
              _propertyTypeKpiData && (item.kpiData = _propertyTypeKpiData);
              return item;
            })
            .sort((a, b) => a.kpiData.getKpiVal() - b.kpiData.getKpiVal());
          this.updateAllPropertyType();
        });
  }

  updateAllPropertyType(): void {
    const _propertyType = this.propertiesKPIS.find((i) => i.id === -1);
    _propertyType &&
      (_propertyType.kpiData = KpiBase.kpiFactory(this.selectedRoot.hasSqUnit).clone(this.selectedPurpose.kpiData));
  }

  updateRentIndicatorsTable(basedOn: indicatorsTypes) {
    this.basedOn$.next(basedOn);
  }
  protected loadTransactions(): Observable<RentTransaction[]> {
    return of(undefined)
      .pipe(delay(0))
      .pipe(
        switchMap(() => {
          return combineLatest([this.reload$, this.paginate$]).pipe(
            switchMap(([, paginationOptions]) => {
              this.criteria.criteria.limit = paginationOptions.limit;
              this.criteria.criteria.offset = paginationOptions.offset;
              return this.dashboardService.loadRentKpiTransactions(this.criteria.criteria);
            }),
            map(({ count, transactionList }) => {
              this.transactionsCount = count;
              return transactionList;
            })
          );
        })
      );
  }

  switchTab(tab: 'rental_indicators' | 'statistical_reports_for_rent'): void {
    this.selectedTab = tab;
    if (this.selectedTab === 'rental_indicators') {
      this.reload$.next();
    }
  }

  paginate($event: PageEvent) {
    this.paginate$.next({
      offset: $event.pageSize * $event.pageIndex,
      limit: $event.pageSize,
    });
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  loadCompositeTransactions(): void {
    this.dashboardService
      .loadRentCompositeTransactions(this.criteria.criteria)
      .pipe(take(1))
      .subscribe((value) => {
        this.compositeTransactions = value.items;
        this.compositeYears = value.years;
      });
  }

  openChart(item: RentTransactionPurpose | RentTransactionPropertyType): void {
    item.openChart(this.criteria.criteria).pipe(take(1)).subscribe();
  }

  isMonthlyDurationType(value: boolean) {
    this.isMonthlyDuration = value;
  }

  getStringSelectedCriteria(isZoneRequired = true, showYearInTitle = true): string {
    return this.sectionTitle.getSelectedCriteria(
      'rent',
      this.criteria.criteria,
      isZoneRequired,
      false,
      showYearInTitle
    );
  }
}
