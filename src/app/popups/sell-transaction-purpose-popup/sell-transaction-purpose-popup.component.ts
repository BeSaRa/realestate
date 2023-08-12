import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { TranslationService } from '@services/translation.service';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { formatNumber } from '@utils/utils';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';

@Component({
  selector: 'app-sell-transaction-purpose-popup',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatNativeDateModule, IconButtonComponent, ButtonComponent],
  templateUrl: './sell-transaction-purpose-popup.component.html',
  styleUrls: ['./sell-transaction-purpose-popup.component.scss'],
})
export class SellTransactionPurposePopupComponent implements AfterViewInit {
  @ViewChild(ChartComponent)
  chart!: ChartComponent;

  lang = inject(TranslationService);
  adapter = inject(DateAdapter);

  data: SellTransactionPurpose[] = inject(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef);

  dataMap = this.data.reduce((acc, item) => {
    return { ...acc, [item.issueMonth]: item };
  }, {} as Record<number, SellTransactionPurpose>);

  months: string[] = [];

  chartOptions: Partial<PartialChartOptions> = {
    series: [],
    chart: {
      type: 'line',
      height: 350,
      width: 600,
    },
    title: {
      text: this.lang.map.year + ' : ' + this.data[0].issueYear.toString(),
      align: 'center',
      floating: true,
      style: {
        fontFamily: 'inherit',
      },
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
          name: this.lang.map.average_price_per_month,
          type: 'column',
          data: this.months.map((month, index) => {
            return {
              y: this.dataMap[index + 1] ? this.dataMap[index + 1].medianPrice : 0,
              x: month,
            };
          }),
        },
      ]);
    });
  }
}
