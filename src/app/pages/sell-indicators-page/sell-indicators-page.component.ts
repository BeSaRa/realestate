import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { SellTransactionIndicator } from '@app-types/sell-indicators-type';
import { ButtonComponent } from '@components/button/button.component';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PropertyBlockComponent } from '@components/property-block/property-block.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { maskSeparator } from '@constants/mask-separator';
import { CriteriaContract } from '@contracts/criteria-contract';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { indicatorsTypes } from '@enums/Indicators-type';
import { ChartType } from '@enums/chart-type';
import { CriteriaType } from '@enums/criteria-type';
import { AppTableDataSource } from '@models/app-table-data-source';
import { ChartOptionsModel } from '@models/chart-options-model';
import { CompositeTransaction } from '@models/composite-transaction';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { SellDefaultValues } from '@models/sell-default-values';
import { SellTop10Model } from '@models/sell-top-10-model';
import { SellTransaction } from '@models/sell-transaction';
import { SellTransactionPropertyType } from '@models/sell-transaction-property-type';
import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
import { TableSortOption } from '@models/table-sort-option';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { UrlService } from '@services/url.service';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel2';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  delay,
  map,
  of,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { BaseFilterComponent } from '@components/base-filter/base-filter.component';
import { PropertyPriceBlockComponent } from '@components/property-price-block/property-price-block.component';
import { MLPriceItem } from '@models/ml-price-item';
import { PriceCriteriaContract } from '@contracts/price-criteria-contract';

@Component({
  selector: 'app-sell-indicators-page',
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
    BaseFilterComponent,
    PropertyPriceBlockComponent,
  ],
  templateUrl: './sell-indicators-page.component.html',
  styleUrls: ['./sell-indicators-page.component.scss'],
})
export default class SellIndicatorsPageComponent implements OnInit, OnDestroy {
  protected readonly IndicatorsType = indicatorsTypes;
  @ViewChildren('carousel') carousel!: QueryList<CarouselComponent>;
  @ViewChildren('top10Chart') top10Chart!: QueryList<ChartComponent>;

  private paginate$ = new BehaviorSubject({
    offset: 0,
    limit: 5,
  });

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  appChartTypesService = inject(AppChartTypesService);

  destroy$ = new Subject<void>();
  reload$ = new ReplaySubject<void>(1);

  private basedOn$ = new BehaviorSubject<indicatorsTypes>(indicatorsTypes.PURPOSE);

  municipalities = this.lookupService.sellLookups.municipalityList;
  propertyTypes = this.lookupService.sellLookups.propertyTypeList;
  pricePropertyTypes = this.lookupService.sellLookups.propertyTypeList
    .filter(x => x.lookupKey !== -1)
    .map(e => new Lookup().clone<Lookup>(e));
  propertyUsages = this.lookupService.sellLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.sellLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  // zones = this.lookupService.sellLookups.zoneList;
  rooms = [] /*this.lookupService.sellLookups.rooms*/;
  paramsRange = this.lookupService.sellLookups.maxParams;

  purposeKPIS = this.lookupService.sellLookups.rentPurposeList;
  propertiesKPIS = this.lookupService.sellLookups.propertyTypeList;

  criteria!: {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  priceCriteria!: {
    criteria: PriceCriteriaContract;
  };

  criteriaSubject = new BehaviorSubject<CriteriaContract | undefined>(undefined);
  priceCriteriaSubject = new BehaviorSubject<PriceCriteriaContract | undefined>(undefined);
  criteria$ = this.criteriaSubject.asObservable();

  rootKPIS = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('the_total_number_of_sell_contracts'),
      this.lang.getEnglishTranslation('the_total_number_of_sell_contracts'),
      false,
      this.urlService.URLS.SELL_KPI1,
      this.urlService.URLS.SELL_KPI2,
      this.urlService.URLS.SELL_KPI3,
      this.urlService.URLS.SELL_KPI19,
      'assets/icons/kpi/svg/7.svg'
    ),
    new KpiRoot(
      4,
      this.lang.getArabicTranslation('the_total_number_of_properties_units_sold'),
      this.lang.getEnglishTranslation('the_total_number_of_properties_units_sold'),
      false,
      this.urlService.URLS.SELL_KPI4,
      this.urlService.URLS.SELL_KPI5,
      this.urlService.URLS.SELL_KPI6,
      this.urlService.URLS.SELL_KPI20,
      'assets/icons/kpi/svg/1.svg'
    ),

    new KpiRoot(
      10,
      this.lang.getArabicTranslation('total_sold_areas'),
      this.lang.getEnglishTranslation('total_sold_areas'),
      false,
      this.urlService.URLS.SELL_KPI10,
      this.urlService.URLS.SELL_KPI11,
      this.urlService.URLS.SELL_KPI12,
      this.urlService.URLS.SELL_KPI22,
      'assets/icons/kpi/svg/3.svg'
    ),
    new KpiRoot(
      7,
      this.lang.getArabicTranslation('the_total_value_of_sell_contracts'),
      this.lang.getEnglishTranslation('the_total_value_of_sell_contracts'),
      true,
      this.urlService.URLS.SELL_KPI7,
      this.urlService.URLS.SELL_KPI8,
      this.urlService.URLS.SELL_KPI9,
      this.urlService.URLS.SELL_KPI21,
      'assets/icons/kpi/svg/6.svg'
    ),
    new KpiRoot(
      16,
      this.lang.getArabicTranslation('sell_average_price_per_square_meter_square_foot'),
      this.lang.getEnglishTranslation('sell_average_price_per_square_meter_square_foot'),
      true,
      this.urlService.URLS.SELL_KPI16,
      this.urlService.URLS.SELL_KPI17,
      this.urlService.URLS.SELL_KPI18,
      this.urlService.URLS.SELL_KPI24,
      'assets/icons/kpi/svg/5.svg'
    ),
    new KpiRoot(
      13,
      this.lang.getArabicTranslation('average_sell_price_per_unit_property'),
      this.lang.getEnglishTranslation('average_sell_price_per_unit_property'),
      true,
      this.urlService.URLS.SELL_KPI13,
      this.urlService.URLS.SELL_KPI14,
      this.urlService.URLS.SELL_KPI15,
      this.urlService.URLS.SELL_KPI23,
      'assets/icons/kpi/svg/2.svg'
    ),
  ];

  selectedRoot?: KpiRoot;
  rootDataSubject = new BehaviorSubject<KpiRoot | undefined>(undefined);
  rootData$ = this.rootDataSubject.asObservable();

  selectedPurpose?: Lookup = this.lookupService.sellLookups.rentPurposeList[0];

  get priceList() {
    return this.rootKPIS.filter((item) => item.hasPrice);
  }

  get nonePriceList() {
    return this.rootKPIS.filter((item) => !item.hasPrice);
  }

  accordingToList: Lookup[] = [
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('number_of_sell_contracts'),
      enName: this.lang.getEnglishTranslation('number_of_sell_contracts'),
      selected: true,
      hasPrice: false,
      url: this.urlService.URLS.SELL_KPI30,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('average_price_per_unit'),
      enName: this.lang.getEnglishTranslation('average_price_per_unit'),
      hasPrice: true,
      url: this.urlService.URLS.SELL_KPI31,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('transactions_value'),
      enName: this.lang.getEnglishTranslation('transactions_value'),
      hasPrice: true,
      url: this.urlService.URLS.SELL_KPI32,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('sold_areas'),
      enName: this.lang.getEnglishTranslation('sold_areas'),
      url: this.urlService.URLS.SELL_KPI33,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('number_of_units'),
      enName: this.lang.getEnglishTranslation('number_of_units'),
      url: this.urlService.URLS.SELL_KPI33_1,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('average_price_per_square_meter'),
      enName: this.lang.getEnglishTranslation('average_price_per_square_meter'),
      url: this.urlService.URLS.SELL_KPI33_2,
      hasPrice: true,
    }),
  ];

  // transactions = new ReplaySubject<SellTransaction[]>(1);
  transactions$: Observable<SellTransaction[]> = this.loadTransactions();
  dataSource: AppTableDataSource<SellTransaction> = new AppTableDataSource(this.transactions$);
  transactionsCount = 0;

  //MLPriceItemSubject :BehaviorSubject<MLPriceItem>;//= new BehaviorSubject<MLPriceItem>();
  priceItem!: MLPriceItem;// = this.MLPriceItemSubject.asObservable();



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

  protected readonly ChartType = ChartType;
  top10ChartData: SellTop10Model[] = [];
  selectedTop10: Lookup = this.accordingToList[0];
  selectedTop10ChartType: 'bar' | 'line' = ChartType.BAR;
  selectedIndicators = this.IndicatorsType.PURPOSE;
  top10ChartOptions = {
    bar: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.bar),
    line: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.line),
  };

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

  selectedTab: 'sell_indicators' | 'statistical_reports_for_sell' = 'sell_indicators';

  ngOnInit(): void {
    this._initializeChartsFormatters();
    this.reload$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  // toggleFilters(): void {
  //   this.isOpened = !this.isOpened;
  // }
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
      this.carousel.setDirty();
    } else {
      this.top10Chart.setDirty();
    }
    setTimeout(() => {
      if (this.selectedTab === 'statistical_reports_for_sell') {
        this.updateTop10Chart();
      }
    });
  }

  updateSellIndicatorsTable(basedOn: indicatorsTypes) {
    this.basedOn$.next(basedOn);
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

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };
    this.criteriaSubject.next(criteria);
    if (type === CriteriaType.DEFAULT) {
      // load default
      this.dashboardService.loadSellDefaults(criteria as Partial<SellCriteriaContract>).subscribe((result) => {
        this.setDefaultRoots(result[0]);
        this.rootItemSelected(this.rootKPIS[0]);
        this.selectTop10Chart(this.selectedTop10);
      });
    } else {
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

      this.rootItemSelected(this.selectedRoot);
      this.selectTop10Chart(this.selectedTop10);
    }
    // this.loadTransactions();
    this.reload$.next();
    this.loadCompositeTransactions();
    this.setIndicatorsTableDataSource();
    // this.loadRoomCounts();
  }
  priceFilterChange(criteria: PriceCriteriaContract) {
    console.log("criteria", criteria)
    this.priceCriteria = {criteria};
    this.priceCriteriaSubject.next(criteria);
      this.dashboardService.loadPropertyTypePrice(criteria).pipe(take(1)).subscribe((result) => {
        this.priceItem = new MLPriceItem().clone<MLPriceItem>({
          kpiCurrent: result[0].kpiCurrent,
          kpiPast: result[0].kpiPast,
          kpiPredicated: result[0].kpiPredicated,
          propertyTypeId: criteria.propertyTypeList[0],
          propertyTypeInfo: this.lookupService.sellPropertyTypeMap[criteria.propertyTypeList[0]]
        });
      });
  }

  private setDefaultRoots(sellDefaultValue?: SellDefaultValues) {
    if (!sellDefaultValue) {
      this.rootKPIS.forEach((item) => {
        item.setValue(0);
        item.setYoy(0);
      });
    } else {
      this.rootKPIS.forEach((item) => {
        const value = `kpi${item.id}Val`;
        const yoy = `kpiYoY${item.id}`;
        item.setValue(sellDefaultValue[value as keyof SellDefaultValues]);
        item.setYear(sellDefaultValue.issueYear);
        item.setYoy(sellDefaultValue[yoy as keyof SellDefaultValues]);
      });
    }
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
      .subscribe((subKPI) => {
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
        this.rootDataSubject.next(this.selectedRoot);
        if (this.selectedTab === 'statistical_reports_for_sell') {
          this.updateTop10Chart();
        }
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

  protected loadTransactions(): Observable<SellTransaction[]> {
    return of(undefined)
      .pipe(delay(0))
      .pipe(
        switchMap(() => {
          return combineLatest([this.reload$, this.paginate$]).pipe(
            switchMap(([, paginationOptions]) => {
              this.criteria.criteria.limit = paginationOptions.limit;
              this.criteria.criteria.offset = paginationOptions.offset;
              return this.dashboardService.loadSellKpiTransactions(this.criteria.criteria);
            }),
            map(({ count, transactionList }) => {
              this.transactionsCount = count;
              return transactionList;
            })
          );
        })
      );
  }

  openChart(item: SellTransactionPurpose | SellTransactionPropertyType): void {
    item.openChart(this.criteria.criteria).subscribe();
  }
  selectTop10Chart(item: Lookup): void {
    this.accordingToList.forEach((i) => {
      i === item ? (i.selected = true) : (i.selected = false);
    });
    this.selectedTop10 = item;
    this.dashboardService.loadSellTop10BasedOnCriteria(item, this.criteria.criteria).subscribe((top10ChartData) => {
      this.top10ChartData = top10ChartData;
      this.updateTop10Chart();
    });
  }

  updateTop10Chart(): void {
    if (!this.top10Chart.length) return;
    this.top10Chart.first
      .updateOptions(
        {
          series: [
            {
              name: this.selectedTop10.getNames(),
              data: this.top10ChartData.map((item) => {
                return { x: item.zoneInfo.getNames(), y: item.kpiVal };
              }),
            },
          ],
        },
        true
      )
      .then();
  }

  isSelectedTop10ChartType(type: ChartType) {
    return this.selectedTop10ChartType === type;
  }

  updateTop10ChartType(type: ChartType) {
    this.selectedTop10ChartType = type as 'line' | 'bar';
    this.top10Chart.first
      .updateOptions(this.top10ChartOptions[this.selectedTop10ChartType], true)
      .then(() => this.updateTop10Chart());
  }

  loadCompositeTransactions(): void {
    this.dashboardService.loadSellCompositeTransactions(this.criteria.criteria).subscribe((value) => {
      this.compositeTransactions = value.items;
      this.compositeYears = value.years;
    });
  }

  protected readonly maskSeparator = maskSeparator;

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

  protected getSelectedArea(isMuniciRequired: boolean, isDistrictRequired: boolean): string {
    const generatedTitle: string[] = [];
    const municipality = isMuniciRequired ? this.getSelectedMunicipality() : '';
    const district = isDistrictRequired ? this.getSelectedDistrict() : '';
    municipality.length && generatedTitle.push(municipality);
    district.length && generatedTitle.push(district);
    return generatedTitle.length ? `(${generatedTitle.join(' , ')})` : '';
  }

  private getSelectedMunicipality(): string {
    if (this.criteria.criteria.municipalityId === -1) return '';
    return this.lookupService.sellMunicipalitiesMap[this.criteria.criteria.municipalityId].getNames() || '';
  }

  private getSelectedDistrict(): string {
    const areaCode = (this.criteria.criteria as SellCriteriaContract).areaCode;
    if (areaCode === -1) return '';
    return this.lookupService.sellDistrictMap[areaCode].getNames() || '';
  }

  private getSelectedPropertyType(): string {
    return this.criteria.criteria.propertyTypeList &&
      this.criteria.criteria.propertyTypeList.length == 1 &&
      this.criteria.criteria.propertyTypeList[0] !== -1
      ? this.lookupService.sellPropertyTypeMap[this.criteria.criteria.propertyTypeList[0]].getNames()
      : '';
  }

  private getSelectedPurpose(): string {
    return this.criteria.criteria.purposeList &&
      this.criteria.criteria.purposeList.length == 1 &&
      this.criteria.criteria.purposeList[0] !== -1
      ? this.lookupService.sellPurposeMap[this.criteria.criteria.purposeList[0]].getNames()
      : '';
  }

  private _initializeChartsFormatters() {
    [this.top10ChartOptions.line, this.top10ChartOptions.bar].forEach((chart) => {
      chart
        .addDataLabelsFormatter((val, opts) =>
          this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.selectedTop10)
        )
        .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, this.selectedTop10))
        .addAxisXFormatter((val, opts) => this.appChartTypesService.axisXFormatter({ val, opts }, this.selectedTop10));
    });
  }
}
