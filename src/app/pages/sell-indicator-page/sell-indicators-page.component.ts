import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DataService } from '@services/data.service';
import { AbstractControl, FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MunicipalityContract } from '@contracts/municipality-contract';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { delay, merge, startWith, tap } from 'rxjs';
import { KpiContract } from '@contracts/kpi-contract';
import { CategoryContract } from '@contracts/category-contract';
import { ChartOptions } from '@app-types/ChartOptions';
import { formatNumber } from '@utils/utils';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-sell-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    NgOptimizedImage,
    MatAutocompleteModule,
    ReactiveFormsModule,
    NgApexchartsModule,
  ],
  templateUrl: './sell-indicators-page.component.html',
  styleUrls: ['./sell-indicators-page.component.scss'],
})
export default class SellIndicatorsPageComponent implements OnInit {
  dataService = inject(DataService);
  control = new FormControl('', { nonNullable: true });
  fb = inject(UntypedFormBuilder);

  lang = inject(TranslationService);

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

  @ViewChild('sqrChart', { static: true }) sqrChart!: ChartComponent;
  @ViewChild('sellVolume', { static: true }) sellVolumeChart!: ChartComponent;

  public sqrChartOptions!: ChartOptions;
  public sellVolumeChartOptions!: ChartOptions;

  sqrF?: KpiContract;
  avgUnit?: KpiContract;
  sellCount?: KpiContract;

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
    this.sqrChartOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: true,
        },
      },
      colors: ['#00E396'],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: 'smooth',
      },
      title: {
        text: `${this.lang.map.average_price_per_square_foot.toCapitalAll()} ( QR )`,
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
      },
      tooltip: {
        x: {
          show: false,
        },
      },
    };
    this.sellVolumeChartOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: true,
        },
      },
      colors: ['#008FFB'],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: 'smooth',
      },
      title: {
        text: `${this.lang.map.number_of_sales_transactions.toCapitalAll()} ( ${this.lang.map.annual.toCapital()} )`,
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
      },
      tooltip: {
        x: {
          show: false,
        },
      },
    };
  }

  listenToInputChanges(): void {
    merge(this.year.valueChanges, this.code.valueChanges, this.category.valueChanges)
      .pipe(startWith([this.year.value, this.code.value, this.category.value]))
      .pipe(
        tap(() => {
          this.sellCount = undefined;
          this.avgUnit = undefined;
          this.sqrF = undefined;
        }),
        delay(500)
      )
      .subscribe(() => {
        this.updateChart();
      });
  }

  private updateChart() {
    this.getSQRF();
    this.getUnitAvg();
    this.getSellCount();
    this.filterResult();
  }

  private getSQRF(): void {
    const { code, year, category } = this.getValues();
    this.sqrF = this.dataService.pricePerSQRF.find((item) => {
      return item.year === year && item.code === code && item.categoryCode === category;
    });
    if (this.sqrF) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.sqrF!.avg_value_sqrf = Math.round(this.sqrF!.avg_value_sqrf);
    } else {
      this.sqrF = {} as KpiContract;
    }
  }

  private getUnitAvg(): void {
    const { code, year, category } = this.getValues();
    this.avgUnit = this.dataService.avgUnitPrice.find((item) => {
      return item.year === year && item.code === code && item.categoryCode === category;
    });

    if (this.avgUnit) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.avgUnit!.avg_value_mt = formatNumber(Math.round(this.avgUnit!.avg_value_mt)) as number;
    } else {
      this.avgUnit = {} as KpiContract;
    }
  }

  private getSellCount(): void {
    const { code, year, category } = this.getValues();
    this.sellCount = this.dataService.sellCount.find((item) => {
      return item.year === year && item.code === code && item.categoryCode === category;
    });

    if (!this.sellCount) {
      this.sellCount = {} as KpiContract;
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
    const { category, code } = this.getValues();
    const perSqrFoot = this.dataService.pricePerSQRF.filter((item) => {
      return item.code === code && item.categoryCode === category;
    });
    const sellCount = this.dataService.sellCount.filter((item) => {
      return item.code === code && item.categoryCode === category;
    });

    this.sqrChart
      .updateOptions({
        chart: {
          type: 'line',
        },
        series: [
          {
            name: this.lang.map.average_price_per_square_foot.toCapital(),
            data: perSqrFoot.map((item) => Math.round(item.avg_value_sqrf)),
          },
        ],
        xaxis: {
          categories: perSqrFoot.map((item) => item.year),
        },
      })
      .then();

    this.sellVolumeChart
      .updateOptions({
        chart: {
          type: 'line',
        },
        series: [
          {
            name: this.lang.map.number_of_transactions.toCapital(),
            data: sellCount.map((item) => item.avg_value_mt),
          },
        ],
        xaxis: {
          categories: sellCount.map((item) => item.year),
        },
      })
      .then();
  }
}
