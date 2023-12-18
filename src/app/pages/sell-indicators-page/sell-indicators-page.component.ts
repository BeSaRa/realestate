import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { SellTransactionIndicator } from '@app-types/sell-indicators-type';
import { ButtonComponent } from '@components/button/button.component';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { ForecastingChartComponent } from '@components/forecasting-chart/forecasting-chart.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PropertyCarouselComponent } from '@components/property-carousel/property-carousel.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { TableComponent } from '@components/table/table.component';
import { TopTenChartComponent } from '@components/top-ten-chart/top-ten-chart.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { APP_PAGES_SECTIONS } from '@constants/injection-tokens';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { SectionGuardDirective } from '@directives/section-guard.directive';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { indicatorsTypes } from '@enums/Indicators-type';
import { CriteriaType } from '@enums/criteria-type';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { AppTableDataSource } from '@models/app-table-data-source';
import { CompositeTransaction } from '@models/composite-transaction';
import { CriteriaSpecificTerms, CriteriaTerms } from '@models/criteria-specific-terms';
import { KpiBase } from '@models/kpi-base';
import { KpiPropertyType } from '@models/kpi-property-type';
import { KpiPurpose } from '@models/kpi-purpose';
import { KpiRoot } from '@models/kpi-root';
import { SellTransaction } from '@models/sell-transaction';
import { SellTransactionPropertyType } from '@models/sell-transaction-property-type';
import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
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
  Observable,
  ReplaySubject,
  combineLatest,
  delay,
  map,
  of,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';

@Component({
  selector: 'app-sell-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    TransactionsFilterComponent,
    KpiRootComponent,
    PurposeComponent,
    PropertyCarouselComponent,
    ButtonComponent,
    IconButtonComponent,
    TableComponent,
    TableColumnTemplateDirective,
    TableColumnHeaderTemplateDirective,
    TableColumnCellTemplateDirective,
    MatTableModule,
    FormatNumbersPipe,
    YoyIndicatorComponent,
    NgxMaskPipe,
    MatSortModule,
    MatNativeDateModule,
    DurationChartComponent,
    TopTenChartComponent,
    ForecastingChartComponent,
    CustomTooltipDirective,
    SectionGuardDirective,
  ],
  templateUrl: './sell-indicators-page.component.html',
  styleUrls: ['./sell-indicators-page.component.scss'],
})
export default class SellIndicatorsPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  protected readonly IndicatorsType = indicatorsTypes;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  sectionTitle = inject(SectionTitleService);
  pageSections = inject(APP_PAGES_SECTIONS).SELL_PAGE;

  reload$ = new ReplaySubject<void>(1);

  private basedOn$ = new BehaviorSubject<indicatorsTypes>(indicatorsTypes.PURPOSE);

  municipalities = this.lookupService.sellLookups.municipalityList;
  propertyTypes = this.lookupService.sellLookups.propertyTypeList;
  propertyUsages = this.lookupService.sellLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.sellLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);

  paramsRange = this.lookupService.sellLookups.maxParams;

  purposeKPIS = this.lookupService.sellLookups.rentPurposeList.map((item) =>
    new KpiPurpose().clone<KpiPurpose>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );
  propertiesKPIS = this.lookupService.sellLookups.propertyTypeList.map((item) =>
    new KpiPropertyType().clone<KpiPropertyType>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );

  criteria = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  isMonthlyDuration = true;

  rootKPIS = [
    new KpiRoot().clone<KpiRoot>({
      id: 1,
      arName: this.lang.getArabicTranslation('the_total_number_of_sell_contracts'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_sell_contracts'),
      url: this.urlService.URLS.SELL_KPI1,
      purposeUrl: this.urlService.URLS.SELL_KPI2,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI3,
      chartDataUrl: this.urlService.URLS.SELL_KPI19,
      iconUrl: 'assets/icons/kpi/svg/7.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 4,
      arName: this.lang.getArabicTranslation('the_total_number_of_properties_units_sold'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_properties_units_sold'),
      url: this.urlService.URLS.SELL_KPI4,
      purposeUrl: this.urlService.URLS.SELL_KPI5,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI6,
      chartDataUrl: this.urlService.URLS.SELL_KPI20,
      iconUrl: 'assets/icons/kpi/svg/1.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 10,
      arName: this.lang.getArabicTranslation('total_sold_areas'),
      enName: this.lang.getEnglishTranslation('total_sold_areas'),
      url: this.urlService.URLS.SELL_KPI10,
      purposeUrl: this.urlService.URLS.SELL_KPI11,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI12,
      chartDataUrl: this.urlService.URLS.SELL_KPI22,
      iconUrl: 'assets/icons/kpi/svg/3.svg',
      hasSqUnit: true,
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 7,
      arName: this.lang.getArabicTranslation('the_total_value_of_sell_contracts'),
      enName: this.lang.getEnglishTranslation('the_total_value_of_sell_contracts'),
      url: this.urlService.URLS.SELL_KPI7,
      purposeUrl: this.urlService.URLS.SELL_KPI8,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI9,
      chartDataUrl: this.urlService.URLS.SELL_KPI21,
      iconUrl: 'assets/icons/kpi/svg/6.svg',
      hasPrice: true,
    }),
    new KpiRoot([
      'areaCode',
      { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
      { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    ]).clone<KpiRoot>({
      id: 16,
      arName: this.lang.getArabicTranslation('sell_average_price_per'),
      enName: this.lang.getEnglishTranslation('sell_average_price_per'),
      url: this.urlService.URLS.SELL_KPI16,
      purposeUrl: this.urlService.URLS.SELL_KPI17,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI18,
      chartDataUrl: this.urlService.URLS.SELL_KPI24,
      iconUrl: 'assets/icons/kpi/svg/5.svg',
      hasPrice: true,
      hasSqUnit: true,
    }),
    new KpiRoot([
      'areaCode',
      { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
      { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    ]).clone<KpiRoot>({
      id: 13,
      arName: this.lang.getArabicTranslation('average_sell_price_per_unit_property'),
      enName: this.lang.getEnglishTranslation('average_sell_price_per_unit_property'),
      url: this.urlService.URLS.SELL_KPI13,
      purposeUrl: this.urlService.URLS.SELL_KPI14,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI15,
      chartDataUrl: this.urlService.URLS.SELL_KPI23,
      iconUrl: 'assets/icons/kpi/svg/2.svg',
      hasPrice: true,
    }),
  ];

  selectedRoot = this.rootKPIS[0];

  selectedPurpose = this.purposeKPIS[0];

  get priceList() {
    return this.rootKPIS.filter((item) => item.hasPrice);
  }

  get nonePriceList() {
    return this.rootKPIS.filter((item) => !item.hasPrice);
  }

  forecastCriteriaTerms = new CriteriaSpecificTerms([
    'municipalityId',
    'areaCode',
    { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL, mapTo: 'propertyTypeId' },
    { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL, mapTo: 'property_usage' },
  ]);

  accordingToList: Top10AccordingTo[] = [
    new Top10AccordingTo().clone<Top10AccordingTo>({
      id: 0,
      arName: this.lang.getArabicTranslation('number_of_sell_contracts'),
      enName: this.lang.getEnglishTranslation('number_of_sell_contracts'),
      hasPrice: false,
      url: this.urlService.URLS.SELL_KPI30,
    }),
    new Top10AccordingTo([
      { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
      { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    ]).clone<Top10AccordingTo>({
      id: 1,
      arName: this.lang.getArabicTranslation('average_price_per_unit'),
      enName: this.lang.getEnglishTranslation('average_price_per_unit'),
      hasPrice: true,
      url: this.urlService.URLS.SELL_KPI31,
    }),
    new Top10AccordingTo().clone<Top10AccordingTo>({
      id: 2,
      arName: this.lang.getArabicTranslation('transactions_value'),
      enName: this.lang.getEnglishTranslation('transactions_value'),
      hasPrice: true,
      url: this.urlService.URLS.SELL_KPI32,
    }),
    new Top10AccordingTo().clone<Top10AccordingTo>({
      id: 3,
      arName: this.lang.getArabicTranslation('sold_areas'),
      enName: this.lang.getEnglishTranslation('sold_areas'),
      url: this.urlService.URLS.SELL_KPI33,
      hasSqUnit: true,
    }),
    new Top10AccordingTo().clone<Top10AccordingTo>({
      id: 4,
      arName: this.lang.getArabicTranslation('number_of_units'),
      enName: this.lang.getEnglishTranslation('number_of_units'),
      url: this.urlService.URLS.SELL_KPI33_1,
    }),
    new Top10AccordingTo([
      { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
      { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    ]).clone<Top10AccordingTo>({
      id: 5,
      arName: this.lang.getArabicTranslation('sell_average_price_per'),
      enName: this.lang.getEnglishTranslation('sell_average_price_per'),
      url: this.urlService.URLS.SELL_KPI33_2,
      hasPrice: true,
      hasSqUnit: true,
    }),
  ];

  top10Label = (item: { kpiVal: number; zoneId: number }) => this.lookupService.sellDistrictMap[item.zoneId].getNames();

  transactionsStatistics$: Observable<SellTransactionIndicator[]> = this.setIndicatorsTableDataSource();
  transactionsStatisticsDatasource = new AppTableDataSource<SellTransactionIndicator>(this.transactionsStatistics$);
  transactionsSortOptions: TableSortOption[] = [
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('most_recent'),
      enName: this.lang.getEnglishTranslation('most_recent'),
      value: {
        column: 'issueDate',
        direction: 'desc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('oldest'),
      enName: this.lang.getEnglishTranslation('oldest'),
      value: {
        column: 'issueDate',
        direction: 'asc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('the_higher_price'),
      enName: this.lang.getEnglishTranslation('the_higher_price'),
      value: {
        column: 'realEstateValue',
        direction: 'desc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('the_lowest_price'),
      enName: this.lang.getEnglishTranslation('the_lowest_price'),
      value: {
        column: 'realEstateValue',
        direction: 'asc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('highest_price_per_square_foot'),
      enName: this.lang.getEnglishTranslation('highest_price_per_square_foot'),
      value: {
        column: 'priceMT',
        direction: 'desc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('lowest_price_per_square_foot'),
      enName: this.lang.getEnglishTranslation('lowest_price_per_square_foot'),
      value: {
        column: 'priceMT',
        direction: 'asc',
      },
    }),
  ];

  transactionsStatisticsColumns = ['average', 'certificates-count', 'area', 'units-count', 'average-square', 'chart'];

  purposeTableCriteriaTerms = new CriteriaSpecificTerms([
    'areaCode',
    { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
  ]);
  propertyTypeTableCriteriaTerms = new CriteriaSpecificTerms([
    'areaCode',
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

  selectedIndicators = this.IndicatorsType.PURPOSE;

  compositeTransactions: CompositeTransaction[][] = [];
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

  compositeAvgPriceCriteriaTerms = new CriteriaSpecificTerms([
    { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
  ]);

  selectedTab: 'sell_indicators' | 'statistical_reports_for_sell' = 'sell_indicators';

  ngOnInit(): void {
    this.reload$.next();
  }

  protected setIndicatorsTableDataSource(): Observable<SellTransactionIndicator[]> {
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
                  this.dashboardService.loadSellTransactionsBasedOnPurpose(this.criteria.criteria).pipe(
                    map((items) => {
                      return items.slice(0, 5);
                    })
                  )
                : this.dashboardService.loadSellTransactionsBasedOnPropertyType(this.criteria.criteria).pipe(
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

  switchTab(tab: 'sell_indicators' | 'statistical_reports_for_sell'): void {
    this.selectedTab = tab;
    if (this.selectedTab === 'sell_indicators') {
      this.reload$.next();
    }
  }

  updateSellIndicatorsTable(basedOn: indicatorsTypes) {
    this.basedOn$.next(basedOn);
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

    if (!this.selectedRoot.criteriaTerms.validate(criteria)) {
      for (let i = 0; i < this.rootKPIS.length; i++) {
        if (this.rootKPIS[i].criteriaTerms.validate(criteria)) {
          this.selectedRoot = this.rootKPIS[i];
          break;
        }
      }
    }

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

  getTransactionType = () => SellTransaction;

  transactionsLoadFn = (criteria: CriteriaContract) => this.dashboardService.loadSellKpiTransactions(criteria);

  openChart(item: SellTransactionPurpose | SellTransactionPropertyType): void {
    item.openChart(this.criteria.criteria).pipe(take(1)).subscribe();
  }

  loadCompositeTransactions(): void {
    this.dashboardService
      .loadSellCompositeTransactions(this.criteria.criteria)
      .pipe(take(1))
      .subscribe((value) => {
        this.compositeTransactions = value.items;
        this.compositeYears = value.years;
      });
  }

  isMonthlyDurationType(value: boolean) {
    this.isMonthlyDuration = value;
  }

  getStringSelectedCriteria(isDistrictRequired = true, showYearInTitle = true): string {
    return this.sectionTitle.getSelectedCriteria(
      'sell',
      this.criteria.criteria,
      false,
      isDistrictRequired,
      showYearInTitle
    );
  }
}
