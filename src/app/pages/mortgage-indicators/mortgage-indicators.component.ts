import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateAdapter, MatOptionModule } from '@angular/material/core';
import { ChartOptions } from '@app-types/ChartOptions';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ChartType } from '@enums/chart-type';
import { CriteriaType } from '@enums/criteria-type';
import { DurationEndpoints } from '@enums/durations';
import { MortgageCharts } from '@enums/mortgage-charts';
import { TransactionType } from '@enums/transaction-type';
import { KpiBaseModel } from '@models/kpi-base-model';
import { KpiDurationModel } from '@models/kpi-duration-model';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { formatNumber, minMaxAvg } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';

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
  adapter = inject(DateAdapter);

  criteria: { criteria: CriteriaContract; type: CriteriaType } = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  control = new FormControl('', { nonNullable: true });
  fb = inject(UntypedFormBuilder);

  @ViewChild('chart', { static: true }) transactionCountChart!: ChartComponent;
  @ViewChild('chartUnitCount', { static: true }) unitCountChart!: ChartComponent;
  @ViewChild('chartValues', { static: true }) transactionValueChart!: ChartComponent;

  municipalities = this.lookupService.mortLookups.municipalityList;
  propertyUsage = this.lookupService.mortLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  propertyTypes = this.lookupService.mortLookups.propertyTypeList;
  rooms = [] /*this.lookupService.mortLookups.rooms*/;
  areas = this.lookupService.mortLookups.districtList;

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

  protected readonly DurationTypes = DurationEndpoints;
  protected readonly ChartsIndicators = MortgageCharts;

  transactionCount?: Record<string, KpiDurationModel[]>;
  unitCount?: Record<string, KpiDurationModel[]>;
  transactionValues?: Record<string, KpiDurationModel[]>;
  countChartType: ChartType = ChartType.LINE;
  unitCountChartType: ChartType = ChartType.LINE;
  valueChartType: ChartType = ChartType.LINE;

  transactionCountDuration = DurationEndpoints.YEARLY;
  transactionValueDuration = DurationEndpoints.YEARLY;
  unitsCountDuration = DurationEndpoints.YEARLY;

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
      y: [
        {
          title: {
            formatter: (seriesName) => {
              console.log('first series name: ', seriesName);
              return seriesName;
            },
          },
          formatter: (val) => val?.toString(),
        },
        {
          title: {
            formatter: (seriesName) => {
              console.log('second series name: ', seriesName);
              return seriesName;
            },
          },
          formatter: (val) => val?.toString(),
        },
        {
          title: {
            formatter: (seriesName) => {
              console.log('third series name: ', seriesName);
              return seriesName;
            },
          },
          formatter: (val) => val?.toString(),
        },
      ],
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

  // total_mortgage_transactions
  chartUnitCountOptions: Partial<ChartOptions> = {
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
      y: [
        {
          title: {
            formatter: (seriesName) => {
              console.log('first series name: ', seriesName);
              return seriesName;
            },
          },
          formatter: (val) => val?.toString(),
        },
        {
          title: {
            formatter: (seriesName) => {
              console.log('second series name: ', seriesName);
              return seriesName;
            },
          },
          formatter: (val) => val?.toString(),
        },
        {
          title: {
            formatter: (seriesName) => {
              console.log('third series name: ', seriesName);
              return seriesName;
            },
          },
          formatter: (val) => val?.toString(),
        },
      ],
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
        text: this.lang.map.number_of_units,
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

  ngOnInit() {}

  filterChange($event: { criteria: CriteriaContract; type: CriteriaType }): void {
    console.log('$event: ', $event);

    this.criteria = $event;
    this.dashboardService.loadMortgageRoots(this.criteria.criteria).subscribe((values) => {
      console.log('values: ', values);

      this.rootKpis.map((item, index) => {
        item.value = (values[index] && values[index].kpiVal) || 0;
        item.yoy = (values[index] && values[index].kpiYoYVal) || 0;
      });

      this.loadMortgageTransactionChart();
      this.loadMortgageUnitCountChart();
      this.loadMortgageTransactionValueChart();
    });
  }

  loadMortgageTransactionChart(): void {
    this.dashboardService
      .loadMortgageTransactionCountChart(this.criteria.criteria, this.transactionCountDuration)
      .subscribe((value) => {
        this.transactionCount = this.arrangeMortgageChartsData(value);
        console.log({ transactionCount: value });
        this.updateTransactionCountChart();
      });
  }

  loadMortgageTransactionValueChart(): void {
    this.dashboardService.loadMortgageTransactionValueChart(this.criteria.criteria, this.transactionValueDuration).subscribe((value) => {
      this.transactionValues = this.arrangeMortgageChartsData(value);
      console.log({ transactionValues: value });
      this.updateTransactionValueChart();
    });
  }

  loadMortgageUnitCountChart(): void {
    this.dashboardService
      .loadMortgageUnitCountChart(this.criteria.criteria, this.unitsCountDuration)
      .subscribe((value) => {
        this.unitCount = this.arrangeMortgageChartsData(value);
        console.log({ unitCount: value });
        this.updateUnitCountChart();
      });
  }

  updateTransactionCountChart(): void {
    if (!this.transactionCount) return;

    const xaxis =
      Object.keys(this.transactionCount).length > 8
        ? Object.keys(this.transactionCount).slice(-8)
        : Object.keys(this.transactionCount);
    let mort = xaxis.reduce((acc, year) => {
      // console.log(this.lineChartData[year]);
      return [...acc].concat(
        (this.transactionCount &&
          this.transactionCount[year].filter((item) => item.actionType === TransactionType.MORTGAGE)) ||
          []
      );
    }, [] as KpiDurationModel[]);
    let sell = xaxis.reduce((acc, year) => {
      // console.log(this.lineChartData[year]);
      return [...acc].concat(
        (this.transactionCount &&
          this.transactionCount[year].filter((item) => item.actionType === TransactionType.SELL)) ||
          []
      );
    }, [] as KpiDurationModel[]);

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
          {
            name: 'YoY of' + this.lang.map.mortgage,
            data: mort.map((i) => i.kpiP2PYoY),
          },
        ],
        xaxis: {
          categories: xaxis,
        },
      })
      .then(() => {
        this.transactionCountChart.hideSeries('YoY of' + this.lang.map.mortgage);
        // this.transactionCountChart.series;
      });
  }

  updateUnitCountChart(): void {
    if (!this.unitCount) return;

    const xaxis =
      Object.keys(this.unitCount).length > 8 ? Object.keys(this.unitCount).slice(-8) : Object.keys(this.unitCount);
    let mort = xaxis.reduce((acc, year) => {
      // console.log(this.lineChartData[year]);
      return [...acc].concat(
        (this.unitCount &&
          this.unitCount[year].filter((item) => true /*item.actionType === TransactionType.MORTGAGE*/)) ||
          []
      );
    }, [] as KpiDurationModel[]);
    let sell = xaxis.reduce((acc, year) => {
      // console.log(this.lineChartData[year]);
      return [...acc].concat(
        (this.unitCount && this.unitCount[year].filter((item) => item.actionType === TransactionType.SELL)) || []
      );
    }, [] as KpiDurationModel[]);

    console.log('updateUnitCountChart mort: ', mort);
    console.log('updateUnitCountChart sell: ', sell);

    this.unitCountChart
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
          {
            name: 'YoY of' + this.lang.map.mortgage,
            data: mort.map((i) => i.kpiP2PYoY),
          },
        ],
        xaxis: {
          categories: xaxis,
        },
      })
      .then(() => {
        this.unitCountChart.hideSeries('YoY of' + this.lang.map.mortgage);
      });
  }

  updateTransactionValueChart(): void {

    if (!this.transactionValues) return;

    const xaxis =
      Object.keys(this.transactionValues).length > 8 ? Object.keys(this.transactionValues).slice(-8) : Object.keys(this.transactionValues);
    let mort = xaxis.reduce((acc, year) => {
      // console.log(this.lineChartData[year]);
      return [...acc].concat(
        (this.transactionValues &&
          this.transactionValues[year].filter((item) => true /*item.actionType === TransactionType.MORTGAGE*/)) ||
          []
      );
    }, [] as KpiDurationModel[]);
    let sell = xaxis.reduce((acc, year) => {
      // console.log(this.lineChartData[year]);
      return [...acc].concat(
        (this.transactionValues && this.transactionValues[year].filter((item) => item.actionType === TransactionType.SELL)) || []
      );
    }, [] as KpiDurationModel[]);

    console.log('updateTransactionValueChart mort: ', mort);
    console.log('updateTransactionValueChart sell: ', sell);

    this.transactionValueChart
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
          {
            name: 'YoY of' + this.lang.map.mortgage,
            data: mort.map((i) => i.kpiP2PYoY),
          },
        ],
        xaxis: {
          categories: xaxis,
        },
      })
      .then(() => {
        this.transactionValueChart.hideSeries('YoY of' + this.lang.map.mortgage);
      });


    // if (!this.transactionValues) return;
    // const _minMaxAvg = minMaxAvg(
    //   Object.keys(this.transactionValues).map(
    //     (year) => (this.transactionValues && this.transactionValues[year as unknown as number][0].kpiVal) || 0
    //   )
    // );
    // this.transactionValueChart
    //   .updateOptions({
    //     colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
    //     series: [
    //       {
    //         name: this.lang.map.mortgage,
    //         data: Object.keys(this.transactionValues).map((year: string) => {
    //           return {
    //             x: year,
    //             y: this.transactionValues && this.transactionValues[year as unknown as number][0].kpiVal,
    //           };
    //         }),
    //       },
    //     ],
    //   })
    //   .then();
  }

  updateChartType(
    type: ChartType,
    chart: 'transactionCountChart' | 'transactionValueChart' | 'unitCountChart',
    chartProperty: 'countChartType' | 'valueChartType' | 'unitCountChartType'
  ) {
    this[chart]
      .updateOptions({
        chart: { type: type, stacked: type === ChartType.BAR },
        stroke: { show: type !== ChartType.BAR },
      })
      .then();
    this[chartProperty] = type;
  }

  isSelectedChartType(type: ChartType, chartProperty: 'countChartType' | 'valueChartType' | 'unitCountChartType') {
    return this[chartProperty] === type;
  }

  updateChartDuration(durationType: DurationEndpoints, chartIndicator: string) {
    switch (chartIndicator) {
      case this.ChartsIndicators.TransactionsNumber:
        this.transactionCountDuration = durationType;
        this.loadMortgageTransactionChart();
        break;
      case this.ChartsIndicators.UnitsNumber:
        this.unitsCountDuration = durationType;
        this.loadMortgageUnitCountChart();
        break;
      case this.ChartsIndicators.TransactionsValues:
        this.transactionValueDuration = durationType;
        this.loadMortgageTransactionValueChart();
        break;
      default:
        break;
    }
  }

  arrangeMortgageChartsData(values: KpiDurationModel[]): Record<string, KpiDurationModel[]> {
    return values.reduce((acc, item) => {
      if (item.issueYear) {
        if (
          !Object.prototype.hasOwnProperty.call(
            acc,
            !item.issuePeriod
              ? item.issueYear.toString()
              : item.issueYear.toString() + '_' + item.issuePeriod.toString()
          )
        ) {
          !item.issuePeriod
            ? (acc[item.issueYear] = [])
            : (acc[item.issueYear.toString() + '_' + item.issuePeriod.toString()] = []);
        }
        !item.issuePeriod
          ? acc[item.issueYear].push(item)
          : acc[item.issueYear.toString() + '_' + item.issuePeriod.toString()].push(item);
        return { ...acc };
      } else {
        this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
        const months = this.adapter.getMonthNames('long');
        if (!Object.prototype.hasOwnProperty.call(acc, months[item.issuePeriod - 1])) {
          acc[months[item.issuePeriod - 1]] = [];
        }
        acc[months[item.issuePeriod - 1]].push(item);
        return { ...acc };
      }
    }, {} as Record<string, KpiDurationModel[]>);
  }
}
