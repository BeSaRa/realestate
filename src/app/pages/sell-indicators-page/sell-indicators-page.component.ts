import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ButtonComponent } from '@components/button/button.component';
import { CompositeTransactionsTableComponent } from '@components/composite-transactions-table/composite-transactions-table.component';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PropertyCarouselComponent } from '@components/property-carousel/property-carousel.component';
import { PurposeListComponent } from '@components/purpose-list/purpose-list.component';
import { TableComponent } from '@components/table/table.component';
import { TopTenChartComponent } from '@components/top-ten-chart/top-ten-chart.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { APP_PAGES_SECTIONS } from '@constants/injection-tokens';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { SectionGuardDirective } from '@directives/section-guard.directive';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { CriteriaType } from '@enums/criteria-type';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { CriteriaSpecificTerms, CriteriaTerms } from '@models/criteria-specific-terms';
import { KpiPropertyType } from '@models/kpi-property-type';
import { KpiPurpose } from '@models/kpi-purpose';
import { KpiRoot } from '@models/kpi-root';
import { SellTransaction } from '@models/sell-transaction';
import { SellTransactionStatistic } from '@models/sell-transaction-statistic';
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
import { map, take } from 'rxjs';

@Component({
  selector: 'app-sell-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    TransactionsFilterComponent,
    KpiRootComponent,
    PropertyCarouselComponent,
    ButtonComponent,
    IconButtonComponent,
    TableComponent,
    TableColumnTemplateDirective,
    TableColumnHeaderTemplateDirective,
    TableColumnCellTemplateDirective,
    MatTableModule,
    FormatNumbersPipe,
    NgxMaskPipe,
    MatSortModule,
    MatNativeDateModule,
    DurationChartComponent,
    TopTenChartComponent,
    CustomTooltipDirective,
    SectionGuardDirective,
    PurposeListComponent,
    CompositeTransactionsTableComponent,
  ],
  templateUrl: './sell-indicators-page.component.html',
  styleUrls: ['./sell-indicators-page.component.scss'],
})
export default class SellIndicatorsPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  sectionTitle = inject(SectionTitleService);
  pageSections = inject(APP_PAGES_SECTIONS).SELL_PAGE;

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

  statsTableCriteria = this.criteria.criteria;

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

  selectedStatsTableType: 'purpose' | 'propertyType' = 'purpose';

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

  purposeStatsTableCriteriaTerms = new CriteriaSpecificTerms([
    'areaCode',
    { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
  ]);
  propertyTypeStatsTableCriteriaTerms = new CriteriaSpecificTerms([
    'areaCode',
    { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
  ]);

  get isPurposeOrTypeStatsTermsValid() {
    return (
      (this.selectedStatsTableType === 'purpose' &&
        this.purposeStatsTableCriteriaTerms.validate(this.criteria.criteria)) ||
      (this.selectedStatsTableType === 'propertyType' &&
        this.propertyTypeStatsTableCriteriaTerms.validate(this.criteria.criteria))
    );
  }

  get purposeOrTypeStatsTermsText() {
    return this.selectedStatsTableType === 'purpose'
      ? this.purposeStatsTableCriteriaTerms.getCriteriaTermsText()
      : this.propertyTypeStatsTableCriteriaTerms.getCriteriaTermsText();
  }

  selectedTab: 'sell_indicators' | 'statistical_reports_for_sell' = 'sell_indicators';

  ngOnInit(): void {
    this.rootItemSelected(this.selectedRoot);
  }

  switchTab(tab: 'sell_indicators' | 'statistical_reports_for_sell'): void {
    this.selectedTab = tab;
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };

    this.validateSelectedRoot();
    this.updateStatsTableCriteria();
  }

  validateSelectedRoot() {
    if (!this.selectedRoot.criteriaTerms.validate(this.criteria.criteria)) {
      for (let i = 0; i < this.rootKPIS.length; i++) {
        if (this.rootKPIS[i].criteriaTerms.validate(this.criteria.criteria)) {
          this.selectedRoot = this.rootKPIS[i];
          break;
        }
      }
      this.rootKPIS.forEach((i) => {
        this.selectedRoot !== i ? (i.selected = false) : (this.selectedRoot.selected = true);
      });
    }
  }

  rootItemSelected(item?: KpiRoot) {
    if (!item) return;
    this.selectedRoot = item;
    this.rootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });
  }

  getTransactionType = () => SellTransaction;

  transactionsLoadFn = (criteria: CriteriaContract) => this.dashboardService.loadSellKpiTransactions(criteria);

  getTransactionStatsType = () => SellTransactionStatistic;

  transactionsStatsLoadFn = (criteria: CriteriaContract) =>
    this.dashboardService.loadSellTransactionsStatistics(criteria, this.selectedStatsTableType).pipe(
      map((data) => ({
        count: data.length,
        transactionList: data,
      }))
    );

  setSelectedStatsTableType(type: 'purpose' | 'propertyType') {
    this.selectedStatsTableType = type;
    this.updateStatsTableCriteria();
  }

  updateStatsTableCriteria() {
    this.statsTableCriteria = {
      ...this.criteria.criteria,
      purposeList: this.selectedStatsTableType === 'purpose' ? [-1] : this.criteria.criteria.purposeList,
      propertyTypeList: this.selectedStatsTableType === 'propertyType' ? [-1] : this.criteria.criteria.propertyTypeList,
    };
  }

  openStatsChart(item: SellTransactionStatistic) {
    this.dashboardService
      .openSellStatsChartDialog(this.statsTableCriteria, item, this.selectedStatsTableType)
      .pipe(take(1))
      .subscribe();
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
