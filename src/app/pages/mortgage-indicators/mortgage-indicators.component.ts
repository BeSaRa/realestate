import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '@app-types/ChartOptions';
import { TranslationService } from '@services/translation.service';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CriteriaType } from '@enums/criteria-type';
import { LookupService } from '@services/lookup.service';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { KpiRoot } from '@models/kpiRoot';
import { UrlService } from '@services/url.service';
import { DashboardService } from '@services/dashboard.service';
import { KpiModel } from '@models/kpi-model';
import { TransactionType } from '@enums/transaction-type';
import { ChartType } from '@enums/chart-type';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { DurationTypes } from '@enums/durations';
import { ButtonComponent } from '@components/button/button.component';
import { KpiBaseModel } from '@models/kpi-base-model';
import { formatNumber } from '@utils/utils';

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

  criteria: { criteria: CriteriaContract; type: CriteriaType } = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  control = new FormControl('', { nonNullable: true });
  fb = inject(UntypedFormBuilder);

  @ViewChild('chart', { static: true }) transactionCountChart!: ChartComponent;

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

  protected readonly DurationTypes = DurationTypes;

  transactionCount?: Record<number, KpiModel[]>;
  transactionValues?: Record<number, KpiBaseModel[]>;
  countChartType: ChartType = ChartType.LINE;
  valueChartType: ChartType = ChartType.LINE;

  transactionCountDuration = DurationTypes.YEARLY;

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
    colors: ['#A29475', '#8A1538'],
    dataLabels: {
      enabled: true,
      formatter(val: number): string | number {
        return formatNumber(val) as string;
      },
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
    this.criteria = $event;
    this.dashboardService.loadMortgageRoots(this.criteria.criteria).subscribe((values) => {
      this.rootKpis.map((item, index) => {
        item.value = (values[index] && values[index].kpiVal) || 0;
        item.yoy = (values[index] && values[index].kpiYoYVal) || 0;
      });

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

    this.transactionValueChart
      .updateOptions({
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

  updateChartDuration(durationType: DurationTypes) {
    this.transactionCountDuration = durationType;
    this.loadMortgageTransactionChart();
  }
}
