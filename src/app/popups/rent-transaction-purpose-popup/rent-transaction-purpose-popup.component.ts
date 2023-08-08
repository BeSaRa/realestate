import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RentTransactionPurpose } from '@models/rent-transaction-purpose';
import { formatNumber } from '@utils/utils';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-rent-transaction-purpose-popup',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatNativeDateModule],
  templateUrl: './rent-transaction-purpose-popup.component.html',
  styleUrls: ['./rent-transaction-purpose-popup.component.scss'],
})
export class RentTransactionPurposePopupComponent implements AfterViewInit {
  @ViewChild(ChartComponent)
  chart!: ChartComponent;

  lang = inject(TranslationService);
  adapter = inject(DateAdapter);

  data: RentTransactionPurpose[] = inject(MAT_DIALOG_DATA);

  dataMap = this.data.reduce((acc, item) => {
    return { ...acc, [item.issueMonth]: item };
  }, {} as Record<number, RentTransactionPurpose>);

  months: string[] = [];

  series = this.months.map((month, index) =>
    this.dataMap[index + 1] ? this.dataMap[index + 1].rentPaymentMonthly : 0
  );

  chartOptions: Partial<PartialChartOptions> = {
    series: [],
    chart: {
      type: 'line',
      height: 350,
      width: 600,
    },
    plotOptions: {},
    xaxis: {
      type: 'category',
      categories: [],
    },
    dataLabels: {
      enabled: true,
      formatter(val: number): string | number {
        return formatNumber(val);
      },
    },
    yaxis: {
      labels: {
        formatter(val: number): string {
          return formatNumber(val) as string;
        },
      },
    },
  };

  ngAfterViewInit(): void {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    this.months = this.adapter.getMonthNames('long');
    Promise.resolve().then(() => {
      this.chart.updateSeries([
        {
          name: 'data',
          type: 'column',
          data: this.months.map((month, index) => {
            return {
              y: this.dataMap[index + 1] ? this.dataMap[index + 1].rentPaymentMonthly : 0,
              x: month,
            };
          }),
        },
      ]);
    });
  }
}
