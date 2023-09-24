import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ChartOptions } from '@app-types/ChartOptions';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { ChartType } from '@enums/chart-type';
import { CriteriaType } from '@enums/criteria-type';
import { DurationEndpoints } from '@enums/durations';
import { TransactionType } from '@enums/transaction-type';
import { AppTableDataSource } from '@models/app-table-data-source';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { MortgageTransaction } from '@models/mortgage-transaction';
import { TableSortOption } from '@models/table-sort-option';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { formatNumber, minMaxAvg } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { BehaviorSubject, delay, map, Observable, of, ReplaySubject, combineLatest,Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mortgage-indicators',
  standalone: true,
  imports: [
    CommonModule,
    BidiModule,
    ExtraHeaderComponent,
    MatAutocompleteModule,
    MatOptionModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    TransactionsFilterComponent,
    KpiRootComponent,
    IconButtonComponent,
    ButtonComponent,
    TableComponent,
    TableColumnTemplateDirective,
    TableColumnHeaderTemplateDirective,
    TableColumnCellTemplateDirective,
    MatTableModule,
  ],
  templateUrl: './mortgage-indicators.component.html',
  styleUrls: ['./mortgage-indicators.component.scss'],
})
export default class MortgageIndicatorsComponent implements OnInit {
  lang = inject(TranslationService);
  lookupService = inject(LookupService);
  urlService = inject(UrlService);
  dashboardService = inject(DashboardService);
  appChartTypesService = inject(AppChartTypesService);
  destroy$ = new Subject<void>();
  reload$ = new ReplaySubject<void>(1);

  minMaxRealestateValue: Partial<MinMaxAvgContract> = {};

  enableChangeAreaMinMaxValues = true;
  enableChangerealEstateValueMinMaxValues = true;

  criteria: { criteria: CriteriaContract; type: CriteriaType } = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };
length: number = 50;
  control = new FormControl('', { nonNullable: true });
  fb = inject(UntypedFormBuilder);

  @ViewChild('chart', { static: true }) transactionCountChart!: ChartComponent;

  @ViewChild('chartValues', { static: true }) transactionValueChart!: ChartComponent;

  municipalities = this.lookupService.mortLookups.municipalityList;
  propertyUsage = this.lookupService.mortLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  propertyTypes = this.lookupService.mortLookups.propertyTypeList;
  rooms = [] /*this.lookupService.mortLookups.rooms*/;
  areas = this.lookupService.mortLookups.districtList;
  paramsRange = this.lookupService.mortLookups.maxParams;

  private paginate$ = new BehaviorSubject({
    offset: 0,
    limit: 5,
  });

  rootKpis = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('total_mortgage_transactions'),
      this.lang.getEnglishTranslation('total_mortgage_transactions'),
      false,
      this.urlService.URLS.MORT_KPI1,
      '',
      '',
      '',
      'assets/icons/kpi/1.png'
    ),
    new KpiRoot(
      3,
      this.lang.getArabicTranslation('the_total_number_of_mortgaged_units'),
      this.lang.getEnglishTranslation('the_total_number_of_mortgaged_units'),
      false,
      this.urlService.URLS.MORT_KPI3,
      '',
      '',
      '',
      'assets/icons/kpi/2.png'
    ),
    new KpiRoot(
      5,
      this.lang.getArabicTranslation('total_value_of_mortgage_transactions'),
      this.lang.getEnglishTranslation('total_value_of_mortgage_transactions'),
      true,
      this.urlService.URLS.MORT_KPI5,
      '',
      '',
      '',
      'assets/icons/kpi/6.png'
    ),
  ];

  // transactions = new ReplaySubject<MortgageTransaction[]>(1);
  transactions$: Observable<MortgageTransaction[]> = this.loadTransactions();
  dataSource: AppTableDataSource<MortgageTransaction> = new AppTableDataSource(this.transactions$);
  transactionsCount = 0;
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
  protected readonly DurationTypes = DurationEndpoints;

  transactionCount?: Record<number, KpiModel[]>;
  transactionValues?: Record<number, KpiModel[]>;
  countChartType: ChartType = ChartType.LINE;
  valueChartType: ChartType = ChartType.LINE;

  transactionCountDuration = DurationEndpoints.YEARLY;

  protected readonly ChartType = ChartType;

  // total_mortgage_transactions
  chartCountOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      height: 350,
      type: ChartType.LINE,
    },
    colors: ['#A29475', '#8A1538'],
    dataLabels: {
      enabled: true,
      style: { colors: ['#259C80'] },
    },
    legend: {
      fontFamily: 'inherit',
    },
    stroke: {
      show: true,
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: [],
    },
    tooltip: {
      theme: 'light',
      shared: true,
    },
    plotOptions: {
      bar: {
        columnWidth: '30%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    yaxis: {
      title: {
        text: this.lang.map.number_of_transactions,
      },
    },
  };

  chartValueOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      height: 350,
      type: ChartType.LINE,
    },
    colors: ['#A29475'],
    dataLabels: {
      enabled: true,
      formatter(val: number): string | number {
        return formatNumber(val) as string;
      },
      style: { colors: ['#259C80'] },
    },
    legend: {
      fontFamily: 'inherit',
    },
    stroke: {
      show: true,
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: [],
    },
    tooltip: {
      theme: 'light',
      shared: true,
      marker: {
        fillColors: ['#A29475'],
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '30%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    yaxis: {
      title: {
        text: this.lang.map.transactions_value,
      },
      labels: {
        formatter(val: number): string | string[] {
          return formatNumber(val) as string;
        },
      },
    },
  };

  ngOnInit() 
  {
    this.reload$.next();
  }

  filterChange($event: { criteria: CriteriaContract; type: CriteriaType }): void {
    console.log('$event: ', $event);

    this.criteria = $event;
    this.dashboardService.loadMortgageRoots(this.criteria.criteria).subscribe((values) => {
      console.log('values: ', values);

      this.rootKpis.map((item, index) => {
        item.value = (values[index] && values[index].kpiVal) || 0;
        item.yoy = (values[index] && values[index].kpiYoYVal) || 0;
      });
      // this.loadTransactions();
      this.reload$.next();

      this.loadMortgageTransactionChart();
      this.loadMortgageTransactionValueChart();
    });
  }

  loadMortgageTransactionChart(): void {
    this.dashboardService
      .loadMortgageTransactionCountChart(this.criteria.criteria, this.transactionCountDuration)
      .subscribe((value) => {
        this.transactionCount = value;
        console.log({ transactionCount: value });
        this.updateTransactionCountChart();
      });
  }

  loadMortgageTransactionValueChart(): void {
    this.dashboardService.loadMortgageTransactionValueChart(this.criteria.criteria).subscribe((value) => {
      this.transactionValues = value;
      console.log({ transactionValues: value });
      this.updateTransactionValueChart();
    });
  }

  updateTransactionCountChart(): void {
    if (!this.transactionCount) return;

    const xaxis = Object.keys(this.transactionCount);
    const mort = xaxis.reduce((acc, year) => {
      // console.log(this.lineChartData[year]);
      return [...acc].concat(
        (this.transactionCount &&
          this.transactionCount[Number(year)].filter((item) => item.actionType === TransactionType.MORTGAGE)) ||
          []
      );
    }, [] as KpiModel[]);
    const sell = xaxis.reduce((acc, year) => {
      // console.log(this.lineChartData[year]);
      return [...acc].concat(
        (this.transactionCount &&
          this.transactionCount[Number(year)].filter((item) => item.actionType === TransactionType.SELL)) ||
          []
      );
    }, [] as KpiModel[]);

    this.transactionCountChart
      .updateOptions({
        series: [
          {
            name: this.lang.map.mortgage,
            data: mort.map((i) => i.kpiVal),
          },
          {
            name: this.lang.map.sell,
            data: sell.map((i) => i.kpiVal),
          },
        ],
        xaxis: {
          categories: xaxis,
        },
      })
      .then();
  }

  updateTransactionValueChart(): void {
    if (!this.transactionValues) return;
    const _minMaxAvg = minMaxAvg(
      Object.keys(this.transactionValues).map(
        (year) => (this.transactionValues && this.transactionValues[year as unknown as number][0].kpiVal) || 0
      )
    );
    this.transactionValueChart
      .updateOptions({
        colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
        series: [
          {
            name: this.lang.map.mortgage,
            data: Object.keys(this.transactionValues).map((year: string) => {
              return {
                x: year,
                y: this.transactionValues && this.transactionValues[year as unknown as number][0].kpiVal,
              };
            }),
          },
        ],
      })
      .then();
  }

  updateChartType(
    type: ChartType,
    chart: 'transactionCountChart' | 'transactionValueChart',
    chartProperty: 'countChartType' | 'valueChartType'
  ) {
    this[chart]
      .updateOptions({
        chart: { type: type, stacked: type === ChartType.BAR },
        stroke: { show: type !== ChartType.BAR },
      })
      .then();
    this[chartProperty] = type;
  }

  isSelectedChartType(type: ChartType, chartProperty: 'countChartType' | 'valueChartType') {
    return this[chartProperty] === type;
  }

  updateChartDuration(durationType: DurationEndpoints) {
    this.transactionCountDuration = durationType;
    this.loadMortgageTransactionChart();
  }

  paginate($event: PageEvent) {
    this.paginate$.next({
      offset: $event.pageSize * $event.pageIndex,
      limit: $event.pageSize,
    });
  }

  // private loadTransactions() {
  //   this.dashboardService
  //     .loadMortgageKpiTransactions(this.criteria.criteria)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((list) => {
  //       if (this.enableChangerealEstateValueMinMaxValues) {
  //         this.minMaxRealestateValue = minMaxAvg(list.map((item) => item.realEstateValue));
  //       }
  //       if (this.enableChangeAreaMinMaxValues) {
  //       }
  //       console.log(list);
  //       this.transactions.next(list);
  //     });
  // }

  protected loadTransactions(): Observable<MortgageTransaction[]> {
    return of(undefined)
      .pipe(delay(0))
      .pipe(
        switchMap(() => {
          return combineLatest([this.reload$, this.paginate$]).pipe(
            switchMap(([,paginationOptions]) => {
              this.criteria.criteria.limit = paginationOptions.limit;
              this.criteria.criteria.offset = paginationOptions.offset;
              return this.dashboardService.loadMortgageKpiTransactions(this.criteria.criteria);
            }),
            map(({count, transactionList}) => {

              this.length = count;
              
              if (this.enableChangerealEstateValueMinMaxValues) {
                this.minMaxRealestateValue = minMaxAvg(transactionList.map((item) => item.realEstateValue));
              }
              if (this.enableChangeAreaMinMaxValues) {
                //
              }
              
              return transactionList;
            })
          );
        })
      );
  }
}
