import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RentTransactionPurpose } from '@models/rent-transaction-purpose';
import { formatChartColors, formatNumber, minMaxAvg } from '@utils/utils';
import { TranslationService } from '@services/translation.service';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { ButtonComponent } from '@components/button/button.component';
import { NgxMaskPipe } from 'ngx-mask';
import { maskSeparator } from '@constants/mask-separator';

@Component({
  selector: 'app-rent-transaction-purpose-popup',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatNativeDateModule, IconButtonComponent, ButtonComponent],
  templateUrl: './rent-transaction-purpose-popup.component.html',
  providers: [NgxMaskPipe],
  styleUrls: ['./rent-transaction-purpose-popup.component.scss'],
})
export class RentTransactionPurposePopupComponent implements AfterViewInit {
  @ViewChild(ChartComponent)
  chart!: ChartComponent;

  lang = inject(TranslationService);
  adapter = inject(DateAdapter);

  data: RentTransactionPurpose[] = inject(MAT_DIALOG_DATA);
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
    // title: {
    //   text: this.lang.map.year + ' : ' + this.data[0].issueYear.toString(),
    //   align: 'center',
    //   floating: true,
    //   style: {
    //     fontFamily: 'inherit',
    //   },
    // },
    plotOptions: {},

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
          text: this.lang.map.average_price_per_month,
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
          text: this.lang.map.rent_contracts_count,
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
    xaxis: {
      tickPlacement: 'between',
      labels: {
        formatter: function (val: string) {
          if (typeof val === 'string') {
            const index = val.indexOf(' - ');
            return val.slice(0, index);
          }
          return '';
        },
      },
      group: {
        style: { fontSize: '16px', fontWeight: 700 },
        groups: [...this._getGroups()],
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
          data: this.data.map((item) => {
            return {
              y: item.rentPaymentMonthly,
              x: this.months[item.issueMonth - 1] + ' - ' + item.issueYear,
            };
          }),
        },
        {
          name: this.lang.map.rent_contracts_count,
          type: 'line',
          data: this.data.map((item) => {
            return {
              y: item.certificateCount,
              x: this.months[item.issueMonth - 1] + ' - ' + item.issueYear,
            };
          }),
        },
      ]);
      const _minMaxAvg = minMaxAvg(this.data.map((item) => item.rentPaymentMonthly));
      this.chart.updateOptions({
        colors: [formatChartColors(_minMaxAvg)],
        tooltip: {
          x: {
            formatter: function (val: string) {
              return val;
            },
          },
        },
      });
    });
  }

  private _getGroups(): { title: string; cols: number }[] {
    // this.data = [
    //   ...this.data,
    //   ...[9, 10, 11, 12].map((month) => {
    //     const d = { ...this.data[0] } as SellTransactionPurpose;
    //     d.issueMonth = month;
    //     d.issueYear = 2022;
    //     return d;
    //   }),
    // ];
    this.data.sort((a, b) => {
      if (a.issueYear !== b.issueYear) return a.issueYear - b.issueYear;
      return a.issueMonth - b.issueMonth;
    });
    const groupsObject = this.data.reduce((acc, cur) => {
      if (Object.prototype.hasOwnProperty.call(acc, cur.issueYear)) {
        acc[cur.issueYear]++;
        return acc;
      } else {
        return { ...acc, [cur.issueYear]: 1 };
      }
    }, {} as Record<number, number>);

    return Object.keys(groupsObject)
      .map((year) => ({ title: year, cols: groupsObject[year as unknown as number] }))
      .sort((a, b) => (a.title as unknown as number) - (b.title as unknown as number));
  }
}
