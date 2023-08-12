import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { maskSeparator } from '@constants/mask-separator';
import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
import { TranslationService } from '@services/translation.service';
import { formatNumber } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-sell-transaction-purpose-popup',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatNativeDateModule, IconButtonComponent, ButtonComponent],
  providers: [NgxMaskPipe],

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

  months: string[] = [];

  maskPipe = inject(NgxMaskPipe);

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
      formatter: (val: number, { seriesIndex }): string | number => {
        return seriesIndex === 0
          ? formatNumber(val)
          : this.maskPipe.transform(val, maskSeparator.SEPARATOR, {
              thousandSeparator: maskSeparator.THOUSAND_SEPARATOR,
            });
      },
    },
    yaxis: [
      {
        title: {
          text: this.lang.map.average_price,
        },
        labels: {
          formatter(val: number): string {
            return formatNumber(val) as string;
          },
        },
      },
      {
        opposite: true,
        title: {
          text: this.lang.map.number_of_sell_contracts,
        },
        labels: {
          formatter: (val: number): string => {
            return this.maskPipe.transform(val, maskSeparator.SEPARATOR, {
              thousandSeparator: maskSeparator.THOUSAND_SEPARATOR,
            });
          },
        },
      },
    ],
  };

  ngAfterViewInit(): void {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    this.months = this.adapter.getMonthNames('long');
    console.log(this.months);
    Promise.resolve().then(() => {
      this.chart.updateSeries([
        {
          name: this.lang.map.average_price,
          type: 'column',
          data: this.data.map((item) => {
            return {
              y: item.medianPrice,
              x: this.months[item.issueMonth - 1],
            };
          }),
        },
        {
          name: this.lang.map.number_of_sell_contracts,
          type: 'line',
          data: this.data.map((item) => {
            return {
              y: item.countCertificateCode,
              x: this.months[item.issueMonth - 1],
            };
          }),
        },
      ]);
    });
  }
}
