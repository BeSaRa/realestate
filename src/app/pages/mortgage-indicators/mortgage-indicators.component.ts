import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { AbstractControl, FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { DataService } from '@services/data.service';
import { MunicipalityContract } from '@contracts/municipality-contract';
import { CategoryContract } from '@contracts/category-contract';
import { KpiContract } from '@contracts/kpi-contract';
import { delay, merge, startWith, tap } from 'rxjs';
import { ChartOptions } from '@app-types/ChartOptions';
import { formatNumber } from '@utils/utils';
import { TranslationService } from '@services/translation.service';

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
  ],
  templateUrl: './mortgage-indicators.component.html',
  styleUrls: ['./mortgage-indicators.component.scss'],
})
export default class MortgageIndicatorsComponent implements OnInit {
  dataService = inject(DataService);
  lang = inject(TranslationService);

  control = new FormControl('', { nonNullable: true });
  fb = inject(UntypedFormBuilder);

  form = this.fb.group({
    year: [2022],
    code: [this.dataService.doha],
    category: [this.dataService.categories[0]],
  });

  displayFn(option: MunicipalityContract) {
    return option.MUNICIPALITY_New;
  }

  displayCatFn(option: CategoryContract) {
    return option.REAL_ESTATE_CATEGORY;
  }

  @ViewChild('mortCountsChart', { static: true }) mortCountChart!: ChartComponent;
  @ViewChild('mortValuesChart', { static: true }) mortValueChart!: ChartComponent;

  public mortVsSellCountsOptions!: ChartOptions;
  public mortVsSellValuesOptions!: ChartOptions;

  mortgageCounts?: KpiContract;
  mortgageValues?: KpiContract;

  get year(): AbstractControl {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.form.get('year')!;
  }

  get code(): AbstractControl {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.form.get('code')!;
  }

  get category(): AbstractControl {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.form.get('category')!;
  }

  ngOnInit() {
    this.listenToInputChanges();
    this._listenToLangChanges();
    this.setAxis();
  }

  private _listenToLangChanges() {
    this.lang.change$.subscribe(() => {
      this.listenToInputChanges();
      this.setAxis();
    });
  }

  setAxis() {
    this.mortVsSellCountsOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'bar',
        zoom: {
          enabled: true,
        },
      },
      colors: ['#0081ff', '#ff0000'],
      dataLabels: {
        background: {
          enabled: false,
        },
        enabled: true,
        offsetX: 0,
        style: {
          fontSize: '12px',
          colors: ['#fff'],
        },
      },
      stroke: {
        curve: 'smooth',
        show: true,
        width: 1,
        colors: ['#fff'],
      },
      title: {
        text: `${this.lang.map.number_of_transactions.toCapitalAll()} ( ${this.lang.map.mortgage.toCapital()} )
       ${this.lang.map.versus} ( ${this.lang.map.sell.toCapital()} ) - ${this.lang.map.annual.toCapital()}`,
        align: 'center',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: [],
        tickPlacement: 'on',
      },
      tooltip: {
        theme: 'light',
        shared: true,
        intersect: false,
        inverseOrder: true,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top',
          },
        },
      },
      yaxis: {
        title: {
          text: this.lang.map.number_of_transactions.toCapitalAll(),
        },
        labels: {
          formatter(val: number) {
            return formatNumber(val) as string;
          },
          minWidth: 50,
        },
      },
    };

    this.mortVsSellValuesOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'bar',
        zoom: {
          enabled: true,
        },
        toolbar: {
          tools: {
            zoom: true,
          },
        },
      },
      colors: ['#0081ff', '#ff0000'],
      dataLabels: {
        enabled: true,
        formatter(val: string | number | number[]): string {
          return formatNumber(Number(val)) as string;
        },
        style: {
          fontSize: '12px',
          colors: ['#fff'],
        },
      },
      stroke: {
        curve: 'smooth',
      },
      title: {
        text: `${this.lang.map.transactions_value.toCapitalAll()} ( ${this.lang.map.mortgage.toCapital()} )
        ${this.lang.map.versus} ( ${this.lang.map.sell.toCapital()} ) - QR`,
        align: 'center',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: [],
        tickPlacement: 'on',
      },
      yaxis: {
        title: {
          text: this.lang.map.price_in_qatari_riyals.toCapitalAll(),
        },
        labels: {
          formatter(val: number) {
            return formatNumber(val) as string;
          },
          minWidth: 50,
        },
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top',
          },
        },
      },
      tooltip: {
        followCursor: false,
        theme: 'light',
        shared: true,
        intersect: false,
        inverseOrder: true,
      },
    };
  }

  listenToInputChanges(): void {
    merge(this.year.valueChanges, this.code.valueChanges, this.category.valueChanges)
      .pipe(startWith([this.year.value, this.code.value, this.category.value]))
      .pipe(
        tap(() => {
          this.mortgageValues = undefined;
          this.mortgageCounts = undefined;
        }),
        delay(500)
      )
      .subscribe(() => {
        this.updateChart();
      });
  }

  private updateChart() {
    this.getTransactionCounts();
    this.getTransactionValues();
    this.filterResult();
  }

  private getTransactionCounts(): void {
    const { code, year, category } = this.getValues();
    this.mortgageCounts = this.dataService.mortCounts.find((item) => {
      return item.year === year && item.code === code && item.categoryCode === category;
    });
    if (this.mortgageCounts) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.mortgageCounts!.avg_value_mt = Math.round(this.mortgageCounts!.avg_value_mt);
    } else {
      this.mortgageCounts = {} as KpiContract;
    }
  }

  private getTransactionValues(): void {
    const { code, year, category } = this.getValues();
    this.mortgageValues = this.dataService.mortValues.find((item) => {
      return item.year === year && item.code === code && item.categoryCode === category;
    });
    if (this.mortgageValues) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.mortgageValues!.avg_value_mt = formatNumber(Math.round(this.mortgageValues!.avg_value_mt)) as number;
    } else {
      this.mortgageValues = {} as KpiContract;
    }
  }

  private getValues() {
    return {
      code: this.code.value.MUNICIPALITY_CODE,
      year: this.year.value,
      category: this.category.value.REAL_ESTATE_CATEGORY_CODE,
    };
  }

  private filterResult() {
    const { category, code /*, year*/ } = this.getValues();
    const mortCounts = this.dataService.mortVsSellCounts
      .filter((item) => {
        return item.code === code && item.categoryCode === category /*&& item.year <= year && item.year >= year - 10*/;
      })
      .reduce(
        (acc, current) => {
          current.TType === 'Sell' ? (acc.sell = [...acc.sell, current]) : (acc.mort = [...acc.mort, current]);
          return acc;
        },
        {
          mort: [],
          sell: [],
        } as { mort: KpiContract[]; sell: KpiContract[] }
      );

    const mortValues = this.dataService.mortVsSellValues
      .filter((item) => {
        return item.code === code && item.categoryCode === category /*&& item.year <= year && item.year >= year - 10*/;
      })
      .reduce(
        (acc, current) => {
          current.TType === 'Sell' ? (acc.sell = [...acc.sell, current]) : (acc.mort = [...acc.mort, current]);
          return acc;
        },
        {
          mort: [],
          sell: [],
        } as { mort: KpiContract[]; sell: KpiContract[] }
      );

    console.log(mortCounts.mort);

    this.mortCountChart
      .updateOptions({
        series: [
          {
            name: this.lang.map.mortgage.toCapital(),
            data: mortCounts.mort.map((item) => Math.round(item.avg_value_mt)),
          },
          {
            name: this.lang.map.sell.toCapital(),
            data: mortCounts.sell.map((item) => Math.round(item.avg_value_mt)),
          },
        ],
        xaxis: {
          categories: mortCounts.mort.map((item) => item.year),
        },
      })
      .then();

    this.mortValueChart
      .updateOptions({
        series: [
          {
            name: this.lang.map.mortgage.toCapital(),
            data: mortValues.mort.map((item) => Math.round(item.avg_value_mt)),
          },
          {
            name: this.lang.map.sell.toCapital(),
            data: mortValues.sell.map((item) => Math.round(item.avg_value_mt)),
          },
        ],
        xaxis: {
          categories: mortValues.sell.map((item) => item.year),
        },
      })
      .then();
  }
}
