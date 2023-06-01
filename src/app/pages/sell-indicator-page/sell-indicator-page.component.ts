import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DataService } from '@services/data.service';
import { AbstractControl, FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MunicipalityContract } from '@contracts/municipality-contract';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { delay, merge, startWith, tap } from 'rxjs';
import { KpiContract } from '@contracts/kpi-contract';

export type ChartOptions = {
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  series: ApexAxisChartSeries;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  xaxis: ApexXAxis;
};

@Component({
  selector: 'app-sell-indicator-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    NgOptimizedImage,
    MatAutocompleteModule,
    ReactiveFormsModule,
    NgApexchartsModule,
  ],
  templateUrl: './sell-indicator-page.component.html',
  styleUrls: ['./sell-indicator-page.component.scss'],
})
export default class SellIndicatorPageComponent {
  dataService = inject(DataService);
  control = new FormControl('', { nonNullable: true });
  fb = inject(UntypedFormBuilder);

  form = this.fb.group({
    year: [this.dataService.years[0]],
    code: [this.dataService.municipalities[0]],
  });

  displayFn(option: MunicipalityContract) {
    return option.name;
  }

  @ViewChild(ChartComponent, { static: true }) chart!: ChartComponent;

  public chartOptions: ChartOptions;

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

  constructor() {
    this.listenToInputChanges();
    this.chartOptions = {
      series: [
        {
          name: 'Price',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
      ],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      title: {
        text: 'Sale Trend Value (Yearly)',
        align: 'left',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      },
    };
  }

  listenToInputChanges(): void {
    merge(this.year.valueChanges, this.code.valueChanges)
      .pipe(startWith([this.year.value, this.code.value]))
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
  }

  private getSQRF(): void {
    const { code, year } = this.getValues();
    this.sqrF = this.dataService.pricePerSQRF.find((item) => {
      return item.year === year && item.code === code;
    });
  }

  private getUnitAvg(): void {
    const { code, year } = this.getValues();
    this.avgUnit = this.dataService.avgUnitPrice.find((item) => {
      return item.year === year && item.code === code;
    });
  }

  private getSellCount(): void {
    const { code, year } = this.getValues();
    this.sellCount = this.dataService.sellCount.find((item) => {
      return item.year === year && item.code === code;
    });
  }

  private getValues() {
    return {
      code: this.code.value.code,
      year: this.year.value,
    };
  }
}
