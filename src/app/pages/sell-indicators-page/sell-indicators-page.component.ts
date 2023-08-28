import { CommonModule } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { PieChartOptions } from '@app-types/pie-chart-options';
import { ButtonComponent } from '@components/button/button.component';
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
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { ChartType } from '@enums/chart-type';
import { CriteriaType } from '@enums/criteria-type';
import { DurationEndpoints } from '@enums/durations';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { CompositeTransaction } from '@models/composite-transaction';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { RoomNumberKpi } from '@models/room-number-kpi';
import { SellDefaultValues } from '@models/sell-default-values';
import { SellTop10Model } from '@models/sell-top-10-model';
import { SellTransaction } from '@models/sell-transaction';
import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
import { TableSortOption } from '@models/table-sort-option';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { UrlService } from '@services/url.service';
import { formatChartColors, formatNumber, minMaxAvg } from '@utils/utils';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel2';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';
import { ReplaySubject, Subject, forkJoin, map, take, takeUntil } from 'rxjs';

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
  ],
  providers: [NgxMaskPipe],
  templateUrl: './sell-indicators-page.component.html',
  styleUrls: ['./sell-indicators-page.component.scss'],
})
export default class SellIndicatorsPageComponent implements OnInit {
  @ViewChildren('carousel') carousel!: QueryList<CarouselComponent>;
  @ViewChildren('chart') chart!: QueryList<ChartComponent>;
  @ViewChildren('top10Chart') top10Chart!: QueryList<ChartComponent>;
  @ViewChildren('pieChart') pieChart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  appChartTypesService = inject(AppChartTypesService);
  destroy$ = new Subject<void>();
  maskPipe = inject(NgxMaskPipe);
  adapter = inject(DateAdapter);

  municipalities = this.lookupService.sellLookups.municipalityList;
  propertyTypes = this.lookupService.sellLookups.propertyTypeList;
  propertyUsages = this.lookupService.sellLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.sellLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  // zones = this.lookupService.sellLookups.zoneList;
  rooms = [] /*this.lookupService.sellLookups.rooms*/;

  purposeKPIS = this.lookupService.sellLookups.rentPurposeList;
  propertiesKPIS = this.lookupService.sellLookups.propertyTypeList;

  minMaxArea: Partial<MinMaxAvgContract> = {};
  minMaxRealestateValue: Partial<MinMaxAvgContract> = {};

  enableChangeAreaMinMaxValues = true;
  enableChangerealEstateValueMinMaxValues = true;

  criteria!: {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

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
      'assets/icons/kpi/7.png'
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
      'assets/icons/kpi/1.png'
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
      'assets/icons/kpi/3.png'
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
      'assets/icons/kpi/6.png'
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
      'assets/icons/kpi/5.png'
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
      'assets/icons/kpi/2.png'
    ),
  ];

  selectedRoot?: KpiRoot;
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

  protected readonly ChartType = ChartType;
  selectedChartType: ChartType = ChartType.LINE;
  selectedRootChartData!: KpiModel[];
  DurationTypes = DurationEndpoints;
  selectedDurationType: DurationEndpoints = DurationEndpoints.YEARLY;
  chartOptions: Partial<PartialChartOptions> = {
    series: [],
    chart: {
      height: 350,
      type: 'line',
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number): string | number => {
        return this.selectedRoot?.hasPrice
          ? (formatNumber(val) as string)
          : (this.maskPipe.transform(val.toFixed(0), maskSeparator.SEPARATOR, {
              thousandSeparator: maskSeparator.THOUSAND_SEPARATOR,
            }) as unknown as string);
      },
      style: { colors: ['#259C80'] },
    },
    stroke: {
      curve: 'smooth',
      // colors: ['#A29475'],
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: [],
    },
    plotOptions: {
      bar: {
        columnWidth: '40%',
      },
    },
    yaxis: {
      min: 0,
      max: (max: number) => max + 150,
      tickAmount: 10,
      labels: {
        formatter: (val: number): string | string[] => {
          return this.selectedRoot?.hasPrice
            ? (formatNumber(val) as string)
            : (this.maskPipe.transform(val.toFixed(0), 'separator', { thousandSeparator: ',' }) as unknown as string);
        },
        minWidth: 50,
        style: {
          fontWeight: 'bold',
        },
      },
    },
    tooltip: { marker: { fillColors: ['#259C80'] } },
  };

  transactions = new ReplaySubject<SellTransaction[]>(1);
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

  transactionsPurpose: SellTransactionPurpose[] = [];
  transactionsPurposeColumns = [
    'purpose',
    'average',
    'certificates-count',
    'area',
    'units-count',
    'average-square',
    'chart',
  ];

  top10ChartData: SellTop10Model[] = [];
  selectedTop10: Lookup = this.accordingToList[0];
  selectedTop10ChartType = ChartType.BAR;
  top10ChartOptions: Record<string, Partial<PartialChartOptions>> = {
    bar: {
      series: [],
      chart: {
        type: 'bar',
        height: 400,
      },
      dataLabels: {
        enabled: true,
        dropShadow: {
          enabled: true,
        },
        formatter: (val: string): string | number => {
          const value = val as unknown as number;
          return this.selectedTop10?.hasPrice
            ? (formatNumber(value) as string)
            : (this.maskPipe.transform(value.toFixed(0), 'separator', { thousandSeparator: ',' }) as unknown as string);
        },
      },
      stroke: {
        curve: 'smooth',
      },
      grid: {
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: (val: string): string | string[] => {
            if (typeof val === 'string') return val;
            const value = val as unknown as number;
            return this.selectedTop10?.hasPrice
              ? (formatNumber(value) as string)
              : (this.maskPipe.transform(value.toFixed(0), 'separator', {
                  thousandSeparator: ',',
                }) as unknown as string);
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: '20%',
          dataLabels: {
            position: 'bottom',
          },
        },
      },
      yaxis: {
        reversed: true,
        labels: {
          formatter: (val: number | string): string | string[] => {
            return typeof val === 'string'
              ? val
              : this.selectedTop10?.hasPrice
              ? (formatNumber(val) as string)
              : (this.maskPipe.transform(val.toFixed(0), 'separator', { thousandSeparator: ',' }) as unknown as string);
          },
          style: {
            fontFamily: 'inherit',
            fontSize: '15px',
          },
        },
      },
      colors: ['#60d39d'],
    },
    line: {
      series: [],
      chart: {
        type: 'line',
        height: 400,
      },
      dataLabels: {
        enabled: true,
        dropShadow: {
          enabled: true,
        },
        formatter: (val: string): string | number => {
          const value = val as unknown as number;
          return this.selectedTop10?.hasPrice
            ? (formatNumber(value) as string)
            : (this.maskPipe.transform(value.toFixed(0), 'separator', { thousandSeparator: ',' }) as unknown as string);
        },
      },
      stroke: {
        curve: 'smooth',
      },
      grid: {
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: (val: string): string | string[] => {
            if (typeof val === 'string') return val;
            const value = val as unknown as number;
            return this.selectedTop10?.hasPrice
              ? (formatNumber(value) as string)
              : (this.maskPipe.transform(value.toFixed(0), 'separator', {
                  thousandSeparator: ',',
                }) as unknown as string);
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number | string): string | string[] => {
            return typeof val === 'string'
              ? val
              : this.selectedTop10?.hasPrice
              ? (formatNumber(val) as string)
              : (this.maskPipe.transform(val.toFixed(0), 'separator', { thousandSeparator: ',' }) as unknown as string);
          },
          style: {
            fontFamily: 'inherit',
            fontSize: '15px',
          },
        },
      },
      colors: ['#60d39d'],
    },
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

  pieChartData: RoomNumberKpi[] = [];
  pieChartOptions: PieChartOptions = {
    chart: {
      type: 'pie',
      width: 480,
    },
    labels: [],
    series: [1, 2, 53, 69, 7],
    legend: {
      formatter: (val, opts) => {
        return this.lang.getCurrent().direction === 'rtl'
          ? '( ' + opts.w.globals.series[opts.seriesIndex] + ' ) : ' + val
          : val + ' : ( ' + opts.w.globals.series[opts.seriesIndex] + ' )';
      },
    },
  };

  selectedTab = 'sell_indicators';

  ngOnInit(): void {}

  switchTab(tab: string): void {
    this.selectedTab = tab;
    this.carousel.setDirty();
    this.chart.setDirty();
    this.top10Chart.setDirty();
    setTimeout(() => {
      this.updateChartDuration(this.selectedDurationType);
      this.updateTop10Chart();
    });
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };
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
    this.loadTransactions();
    this.loadTransactionsBasedOnPurpose();
    this.loadCompositeTransactions();
    // this.loadRoomCounts();
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

    forkJoin([
      this.dashboardService.loadPurposeKpi(item, this.criteria.criteria),
      this.dashboardService.loadLineChartKpi(item, this.criteria.criteria),
    ]).subscribe(([subKPI, lineChartData]) => {
      this.selectedRootChartData = lineChartData;
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
      this.updateChartDuration(this.selectedDurationType);
      this.updateTop10Chart();
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

  updateChart(): void {
    if (!this.chart.length) return;
    const _minMaxAvg = minMaxAvg(this.selectedRootChartData.map((item) => item.kpiVal));

    this.chart.first
      .updateOptions({
        series: [
          {
            name: this.selectedRoot?.getNames(),
            data: this.selectedRootChartData.map((item) => item.kpiVal),
          },
        ],
        xaxis: {
          categories: this.selectedRootChartData.map((item) => item.issueYear),
        },
        colors: [formatChartColors(_minMaxAvg)],
        tooltip: { marker: { fillColors: ['#259C80'] } },
      })
      .then();
    this.updateChartType(ChartType.BAR);
  }

  updateChartMonthly() {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const months = this.adapter.getMonthNames('long');
    this.dashboardService
      .loadLineChartKpiForDuration(DurationEndpoints.MONTHLY, this.selectedRoot!, this.criteria.criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        data.sort((a, b) => a.issuePeriod - b.issuePeriod);
        const _minMaxAvg = minMaxAvg(data.map((d) => d.kpiVal));
        this.chart.first
          .updateOptions({
            series: [
              {
                name: this.selectedRoot?.getNames(),
                data: data.map((item) => {
                  return {
                    y: item.kpiVal,
                    x: months[item.issuePeriod - 1],
                  };
                }),
              },
            ],
            colors: [formatChartColors(_minMaxAvg)],
            tooltip: { marker: { fillColors: ['#259C80'] } },
          })
          .then();
      });
  }

  updateChartHalfyOrQuarterly() {
    this.dashboardService
      .loadLineChartKpiForDuration(
        this.selectedDurationType === DurationEndpoints.HALFY
          ? DurationEndpoints.HALFY
          : DurationEndpoints.SELL_QUARTERLY,
        this.selectedRoot!,
        this.criteria.criteria
      )
      .pipe(takeUntil(this.destroy$))
      .pipe(
        map((durationData) => {
          return this.dashboardService.mapDurationData(
            durationData,
            this.selectedDurationType === DurationEndpoints.HALFY
              ? this.lookupService.sellLookups.halfYearDurations
              : this.lookupService.sellLookups.quarterYearDurations
          );
        })
      )
      .subscribe((data) => {
        const _chartData = Object.keys(data).map((key) => ({
          name: data[key as unknown as number].period.getNames(),
          data: data[key as unknown as number].kpiValues.map((item) => item.value),
        }));
        this.chart.first
          .updateOptions({
            series: _chartData,
            xaxis: {
              categories: data[1].kpiValues.map((v) => v.year),
            },
            colors: ['#8A1538', '#A29475', '#C0C0C0', '#1A4161'],
            tooltip: { marker: { fillColors: ['#8A1538', '#A29475', '#C0C0C0', '#1A4161'] } },
          })
          .then();
      });
  }

  updateChartType(type: ChartType) {
    this.chart.first.updateOptions({ chart: { type: type } }).then();
    this.selectedChartType = type;
  }

  updateChartDuration(durationType: DurationEndpoints) {
    this.selectedDurationType = durationType;
    if (this.selectedDurationType === DurationEndpoints.YEARLY) this.updateChart();
    else if (this.selectedDurationType === DurationEndpoints.MONTHLY) this.updateChartMonthly();
    else this.updateChartHalfyOrQuarterly();
  }

  isSelectedChartType(type: ChartType) {
    return this.selectedChartType === type;
  }

  private loadTransactions() {
    this.dashboardService
      .loadSellKpiTransactions(this.criteria.criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        if (this.enableChangerealEstateValueMinMaxValues) {
          this.minMaxRealestateValue = minMaxAvg(list.map((item) => item.realEstateValue));
        }
        if (this.enableChangeAreaMinMaxValues) {
        }
        // console.log(list);
        this.transactions.next(list);
      });
  }

  loadTransactionsBasedOnPurpose(): void {
    this.dashboardService.loadSellTransactionsBasedOnPurpose(this.criteria.criteria).subscribe((values) => {
      this.transactionsPurpose = values;
    });
  }

  openChart(item: SellTransactionPurpose): void {
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
          xaxis: {
            categories: [],
          },
        },
        true
      )
      .then();
  }

  isSelectedTop10ChartType(type: ChartType) {
    return this.selectedTop10ChartType === type;
  }

  updateTop10ChartType(type: ChartType) {
    this.selectedTop10ChartType = type;
    this.top10Chart.first
      .updateOptions(this.top10ChartOptions[this.selectedTop10ChartType], true)
      .then(() => this.updateTop10Chart());
  }

  loadRoomCounts(): void {
    this.dashboardService.loadSellRoomCounts(this.criteria.criteria).subscribe((value) => {
      this.pieChartData = value;
      this.updatePiChart();
    });
  }

  updatePiChart(): void {
    if (!this.pieChart.length) return;
    this.pieChart.first
      .updateOptions({
        series: this.pieChartData.length
          ? this.pieChartData.map((i) => i.kpiVal)
          : this.lookupService.sellLookups.rooms.map(() => 0),
        labels: this.pieChartData.length
          ? this.pieChartData.map((i) => i.roomInfo.getNames())
          : this.lookupService.sellLookups.rooms.map((i) => i.getNames()),
      })
      .then();
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
}
