import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';

import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PropertyBlockComponent } from '@components/property-block/property-block.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { RentalContractsComponent } from '@components/rental-contracts/rental-contracts.component';
import { RentalTransactionsMeasuringComponent } from '@components/rental-transactions-measuring/rental-transactions-measuring.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { CriteriaType } from '@enums/criteria-type';
import { KpiRoot } from '@models/kpiRoot';
import { RentDefaultValues } from '@models/rent-default-values';
import { RentTop10Model } from '@models/rent-top-10-model';

import { MatNativeDateModule } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RentTransactionIndicator } from '@app-types/rent-indicators-type';
import { ButtonComponent } from '@components/button/button.component';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { TableComponent } from '@components/table/table.component';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { maskSeparator } from '@constants/mask-separator';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { ChartType } from '@enums/chart-type';
import { indicatorsTypes } from '@enums/Indicators-type';
import { AppTableDataSource } from '@models/app-table-data-source';
import { ChartOptionsModel } from '@models/chart-options-model';
import { RentCompositeTransaction } from '@models/composite-transaction';
import { FurnitureStatusKpi } from '@models/furniture-status-kpi';
import { KpiModel } from '@models/kpi-model';
import { Lookup } from '@models/lookup';
import { RentTransaction } from '@models/rent-transaction';
import { RentTransactionPropertyType } from '@models/rent-transaction-property-type';
import { RentTransactionPurpose } from '@models/rent-transaction-purpose';
import { RoomNumberKpi } from '@models/room-number-kpi';
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
  combineLatest,
  delay,
  forkJoin,
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
    RentalTransactionsMeasuringComponent,
    RentalContractsComponent,
    KpiRootComponent,
    PurposeComponent,
    IvyCarouselModule,
    PropertyBlockComponent,
    NgApexchartsModule,
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
  ],
  templateUrl: './rental-indicators-page.component.html',
  styleUrls: ['./rental-indicators-page.component.scss'],
})
export default class RentalIndicatorsPageComponent implements OnInit, OnDestroy {
  protected readonly ChartType = ChartType;
  protected readonly IndicatorsType = indicatorsTypes;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  appChartTypesService = inject(AppChartTypesService);

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

  criteriaSubject = new BehaviorSubject<CriteriaContract | undefined>(undefined);
  criteria$ = this.criteriaSubject.asObservable();

  // transactions = new ReplaySubject<RentTransaction[]>(1);
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

  criteria!: {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  @ViewChildren('top10Chart')
  top10Chart!: QueryList<ChartComponent>;
  @ViewChildren('pieChart')
  pieChart!: QueryList<ChartComponent>;

  selectedIndicators = this.IndicatorsType.PURPOSE;

  roomsPieChartData: RoomNumberKpi[] = [];
  furnitureStatusPieChartData: FurnitureStatusKpi[] = [];

  @ViewChildren('carousel')
  carousel!: QueryList<CarouselComponent>;
  private paginate$ = new BehaviorSubject({
    offset: 0,
    limit: 5,
  });
  rootKPIS = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('the_total_number_of_lease_contracts'),
      this.lang.getEnglishTranslation('the_total_number_of_lease_contracts'),
      false,
      this.urlService.URLS.RENT_KPI1,
      this.urlService.URLS.RENT_KPI2,
      this.urlService.URLS.RENT_KPI3,
      this.urlService.URLS.RENT_KPI19,
      'assets/icons/kpi/svg/8.svg'
    ),
    new KpiRoot(
      4,
      this.lang.getArabicTranslation('the_total_number_of_properties_units_rented'),
      this.lang.getEnglishTranslation('the_total_number_of_properties_units_rented'),
      false,
      this.urlService.URLS.RENT_KPI4,
      this.urlService.URLS.RENT_KPI5,
      this.urlService.URLS.RENT_KPI6,
      this.urlService.URLS.RENT_KPI20,
      'assets/icons/kpi/svg/1.svg'
    ),

    new KpiRoot(
      10,
      this.lang.getArabicTranslation('total_rented_space'),
      this.lang.getEnglishTranslation('total_rented_space'),
      false,
      this.urlService.URLS.RENT_KPI10,
      this.urlService.URLS.RENT_KPI11,
      this.urlService.URLS.RENT_KPI12,
      this.urlService.URLS.RENT_KPI21,
      'assets/icons/kpi/svg/5.svg'
    ),
    new KpiRoot(
      7,
      this.lang.getArabicTranslation('the_total_value_of_lease_contracts'),
      this.lang.getEnglishTranslation('the_total_value_of_lease_contracts'),
      true,
      this.urlService.URLS.RENT_KPI7,
      this.urlService.URLS.RENT_KPI8,
      this.urlService.URLS.RENT_KPI9,
      this.urlService.URLS.RENT_KPI22,
      'assets/icons/kpi/svg/4.svg'
    ),
    new KpiRoot(
      16,
      this.lang.getArabicTranslation('the_average_price_per_square_meter_square_foot'),
      this.lang.getEnglishTranslation('the_average_price_per_square_meter_square_foot'),
      true,
      this.urlService.URLS.RENT_KPI16,
      this.urlService.URLS.RENT_KPI17,
      this.urlService.URLS.RENT_KPI18,
      this.urlService.URLS.RENT_KPI24,
      'assets/icons/kpi/svg/3.svg'
    ),
    new KpiRoot(
      13,
      this.lang.getArabicTranslation('average_rental_price_per_unit_property'),
      this.lang.getEnglishTranslation('average_rental_price_per_unit_property'),
      true,
      this.urlService.URLS.RENT_KPI13,
      this.urlService.URLS.RENT_KPI14,
      this.urlService.URLS.RENT_KPI15,
      this.urlService.URLS.RENT_KPI23,
      'assets/icons/kpi/svg/2.svg'
    ),
  ];

  accordingToList: Lookup[] = [
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('number_of_lease_contracts'),
      enName: this.lang.getEnglishTranslation('number_of_lease_contracts'),
      selected: true,
      url: this.urlService.URLS.RENT_KPI30,
      hasPrice: false,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('number_of_units'),
      enName: this.lang.getEnglishTranslation('number_of_units'),
      url: this.urlService.URLS.RENT_KPI30_1,
      hasPrice: false,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('average_price_per_month'),
      enName: this.lang.getEnglishTranslation('average_price_per_month'),
      url: this.urlService.URLS.RENT_KPI31,
      hasPrice: true,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('average_price_per_meter'),
      enName: this.lang.getEnglishTranslation('average_price_per_meter'),
      url: this.urlService.URLS.RENT_KPI31_1,
      hasPrice: true,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('contracts_values'),
      enName: this.lang.getEnglishTranslation('contracts_values'),
      url: this.urlService.URLS.RENT_KPI32,
      hasPrice: true,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('rented_spaces'),
      enName: this.lang.getEnglishTranslation('rented_spaces'),
      url: this.urlService.URLS.RENT_KPI33,
      hasPrice: false,
    }),
  ];
  top10ChartData: RentTop10Model[] = [];
  selectedTop10: Lookup = this.accordingToList[0];
  selectedTop10ChartType: 'bar' | 'line' = ChartType.BAR;

  top10ChartOptions = {
    bar: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.bar),
    line: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.line),
  };

  pieChartOptions = this.appChartTypesService.pieChartOptions;

  purposeKPIS = this.lookupService.rentLookups.rentPurposeList;

  propertiesKPIS = this.lookupService.rentLookups.propertyTypeList;

  selectedRoot?: KpiRoot;
  rootDataSubject = new BehaviorSubject<KpiRoot | undefined>(undefined);
  rootData$ = this.rootDataSubject.asObservable();

  selectedPurpose?: Lookup = this.lookupService.rentLookups.rentPurposeList[0];
  selectedTab: 'rental_indicators' | 'statistical_reports_for_rent' = 'rental_indicators';
  // selectedTab = 'statistical_reports_for_rent';

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

  transactionsStatisticsColumns = ['average', 'certificates-count', 'area', 'units-count', 'average-square', 'chart'];

  get priceList() {
    return this.rootKPIS.filter((item) => item.hasPrice);
  }

  get nonePriceList() {
    return this.rootKPIS.filter((item) => !item.hasPrice);
  }

  ngOnInit(): void {
    this._initializeChartsFormatters();
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

  updateAllPurpose(value: number, yoy: number): void {
    const lookup = this.purposeKPIS.find((i) => i.lookupKey === -1);
    lookup && (lookup.value = value) && (lookup.yoy = yoy);
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria: { ...criteria, limit: 5 }, type };
    this.criteriaSubject.next(criteria);

    if (type === CriteriaType.DEFAULT) {
      // load default
      this.dashboardService.loadRentDefaults(criteria as Partial<RentCriteriaContract>).subscribe((result) => {
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
    this.loadRoomCounts();
    this.loadFurnitureStatus();
    this.loadCompositeTransactions();
    // this.basedOn$.next("purpose");
    this.setIndicatorsTableDataSource();
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
      this.rootDataSubject.next(this.selectedRoot);

      if (this.selectedTab === 'statistical_reports_for_rent') {
        this.updateTop10Chart();
      }
    });
  }

  private setDefaultRoots(rentDefaultValue?: RentDefaultValues) {
    if (!rentDefaultValue) {
      this.rootKPIS.forEach((item) => {
        item.setValue(0);
        item.setYoy(0);
      });
    } else {
      this.rootKPIS.forEach((item) => {
        const value = `kpi${item.id}Val`;
        const yoy = `kpiYoY${item.id}`;
        item.setValue(rentDefaultValue[value as keyof RentDefaultValues]);
        item.setYear(rentDefaultValue.issueYear);
        item.setYoy(rentDefaultValue[yoy as keyof RentDefaultValues]);
      });
    }
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
  private goToFirstCell(): void {
    if (!this.carousel.length) return;
    this.carousel.first.cellsToScroll = this.carousel.first.cellLength;
    this.carousel.first.next();
    this.carousel.first.cellsToScroll = 1;
  }

  switchTab(tab: 'rental_indicators' | 'statistical_reports_for_rent'): void {
    this.selectedTab = tab;
    if (this.selectedTab === 'rental_indicators') {
      this.carousel.setDirty();
    } else {
      this.top10Chart.setDirty();
      this.pieChart.setDirty();
    }
    setTimeout(() => {
      if (this.selectedTab === 'statistical_reports_for_rent') {
        this.updateTop10Chart();
        this.updateRoomsPiChart();
        this.updateFurnitureStatusPiChart();
      }
    });
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

  selectTop10Chart(item: Lookup): void {
    this.accordingToList.forEach((i) => {
      i === item ? (i.selected = true) : (i.selected = false);
    });
    this.selectedTop10 = item;
    this.dashboardService.loadRentTop10BasedOnCriteria(item, this.criteria.criteria).subscribe((top10ChartData) => {
      this.top10ChartData = top10ChartData;
      this.updateTop10Chart();
    });
  }

  updateTop10Chart(): void {
    if (!this.top10Chart.length) return;
    this.top10Chart.first
      .updateOptions({
        series: [
          {
            name: this.selectedTop10.getNames(),
            data: this.top10ChartData.map((item) => {
              return { x: (item.zoneInfo && item.zoneInfo.getNames()) || `NA/${item.zoneId}`, y: item.kpiVal };
            }),
          },
        ],
      })
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

  updateRoomsPiChart(): void {
    if (!this.pieChart.length) return;
    this.pieChart.first
      .updateOptions({
        series: this.roomsPieChartData.length
          ? this.roomsPieChartData.map((i) => i.kpiVal)
          : this.lookupService.rentLookups.rooms.map(() => 0),
        labels: this.roomsPieChartData.length
          ? this.roomsPieChartData.map((i) => i.roomInfo.getNames())
          : this.lookupService.rentLookups.rooms.map((i) => i.getNames()),
      })
      .then();
  }

  updateFurnitureStatusPiChart(): void {
    if (!this.pieChart.length) return;
    this.pieChart.last
      .updateOptions({
        series: this.furnitureStatusPieChartData.length
          ? this.furnitureStatusPieChartData.map((i) => i.kpiVal)
          : this.lookupService.rentLookups.furnitureStatusList.map(() => 0),
        labels: this.furnitureStatusPieChartData.length
          ? this.furnitureStatusPieChartData.map((i) => i.furnitureStatusInfo.getNames())
          : this.lookupService.rentLookups.furnitureStatusList.map((i) => i.getNames()),
      })
      .then();
  }

  loadCompositeTransactions(): void {
    this.dashboardService.loadRentCompositeTransactions(this.criteria.criteria).subscribe((value) => {
      this.compositeTransactions = value.items;
      this.compositeYears = value.years;
    });
  }

  loadRoomCounts(): void {
    this.dashboardService.loadRentRoomCounts(this.criteria.criteria).subscribe((value) => {
      this.roomsPieChartData = value;
      this.updateRoomsPiChart();
    });
  }

  loadFurnitureStatus(): void {
    this.dashboardService.loadRentFurnitureStatus(this.criteria.criteria).subscribe((value) => {
      this.furnitureStatusPieChartData = value;
      this.updateFurnitureStatusPiChart();
    });
  }

  // loadTransactionsBasedOnPurpose(): Observable< {
  //   .subscribe((values) => {
  //     this.transactionsPurpose = values;
  //   });
  // }

  // loadTransactionsBasedOnPropertyType(): void {
  //   .subscribe((values) => {
  //     this.transactionsPropertyType = values;
  //   });
  // }

  openChart(item: RentTransactionPurpose | RentTransactionPropertyType): void {
    item.openChart(this.criteria.criteria).subscribe();
  }

  get basedOnCriteria(): string {
    const generatedTitle: string[] = [];
    const municipality = this.getSelectedMunicipality();
    const zone = this.getSelectedZone();
    const purpose = this.getSelectedPurpose();
    const propertyType = this.getSelectedPropertyType();
    municipality.length && generatedTitle.push(municipality);
    zone.length && generatedTitle.push(zone);
    propertyType.length && generatedTitle.push(propertyType);
    purpose.length && generatedTitle.push(purpose);
    return generatedTitle.length ? `(${generatedTitle.join(' , ')})` : '';
  }

  protected getSelectedArea(isMuniciRequired: boolean, isZoneRequired: boolean): string {
    const generatedTitle: string[] = [];
    const municipality = isMuniciRequired ? this.getSelectedMunicipality() : '';
    const district = isZoneRequired ? this.getSelectedZone() : '';
    municipality.length && generatedTitle.push(municipality);
    district.length && generatedTitle.push(district);
    return generatedTitle.length ? `(${generatedTitle.join(' , ')})` : '';
  }

  private getSelectedMunicipality(): string {
    if (this.criteria.criteria.municipalityId === -1) return '';
    return this.lookupService.rentMunicipalitiesMap[this.criteria.criteria.municipalityId].getNames() || '';
  }

  private getSelectedZone(): string {
    if (this.criteria.criteria.zoneId === -1) return '';

    return this.lookupService.rentZonesMap[this.criteria.criteria.zoneId].getNames() || '';
  }

  private getSelectedPropertyType(): string {
    return this.criteria.criteria.propertyTypeList &&
      this.criteria.criteria.propertyTypeList.length == 1 &&
      this.criteria.criteria.propertyTypeList[0] !== -1
      ? this.lookupService.rentPropertyTypeMap[this.criteria.criteria.propertyTypeList[0]].getNames()
      : '';
  }

  private getSelectedPurpose(): string {
    return this.criteria.criteria.purposeList &&
      this.criteria.criteria.purposeList.length == 1 &&
      this.criteria.criteria.purposeList[0] !== -1
      ? this.lookupService.rentPurposeMap[this.criteria.criteria.purposeList[0]].getNames()
      : '';
  }

  private _initializeChartsFormatters() {
    this.top10ChartOptions.line
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.selectedTop10)
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, this.selectedTop10))
      .addAxisXFormatter((val, opts) => this.appChartTypesService.axisXFormatter({ val, opts }, this.selectedTop10));

    this.top10ChartOptions.bar
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.selectedTop10)
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, this.selectedTop10))
      .addAxisXFormatter((val, opts) => this.appChartTypesService.axisXFormatter({ val, opts }, this.selectedTop10));
  }
}
