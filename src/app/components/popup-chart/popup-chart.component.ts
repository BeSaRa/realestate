import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { DialogChartDataContract } from '@contracts/dialog-chart-data-contract';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { TranslationService } from '@services/translation.service';
import { minMaxAvg } from '@utils/utils';
import { ApexYAxis, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-popup-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatNativeDateModule, IconButtonComponent, ButtonComponent],
  providers: [NgxMaskPipe],
  templateUrl: './popup-chart.component.html',
  styleUrls: ['./popup-chart.component.scss'],
})
export class PopupChartComponent implements OnInit, AfterViewInit {
  @ViewChild(ChartComponent)
  chart!: ChartComponent;

  lang = inject(TranslationService);
  adapter = inject(DateAdapter);
  appChartTypesService = inject(AppChartTypesService);

  dialogData: DialogChartDataContract<{ issueYear: number; issueMonth: number }> = inject(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef);

  months: string[] = [];

  maskPipe = inject(NgxMaskPipe);

  chartOptions: Partial<PartialChartOptions> = this.appChartTypesService.popupChartOptions;

  ngOnInit(): void {
    this.chartOptions = {
      ...this.chartOptions,
      dataLabels: {
        ...this.chartOptions.dataLabels,
        formatter: this.appChartTypesService.popupLabelsFormatter(),
      },
      yaxis: [
        {
          ...(this.chartOptions.yaxis as ApexYAxis[])[0],
          title: { ...(this.chartOptions.yaxis as ApexYAxis[])[0].title, text: this.dialogData.mainChart.title },
          labels: {
            ...(this.chartOptions.yaxis as ApexYAxis[])[0].labels,
            formatter: this.appChartTypesService.axisYFormatter({ hasPrice: true }),
          },
        },
        {
          ...(this.chartOptions.yaxis as ApexYAxis[])[1],
          title: { ...(this.chartOptions.yaxis as ApexYAxis[])[1].title, text: this.dialogData.oppositeChart.title },
          labels: {
            ...(this.chartOptions.yaxis as ApexYAxis[])[1].labels,
            formatter: this.appChartTypesService.axisYFormatter({ hasPrice: false }),
          },
        },
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        group: {
          ...this.chartOptions.xaxis?.group,
          groups: [...this._getGroups()],
        },
      },
    };
  }

  ngAfterViewInit(): void {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    this.months = this.adapter.getMonthNames('long');
    Promise.resolve().then(() => {
      this.chart.updateSeries([
        {
          name: this.dialogData.mainChart.title,
          type: 'column',
          data: this.dialogData.list.map((item) => {
            return {
              y: this._getMainChartValue(item),
              x: this.months[item.issueMonth - 1] + ' - ' + item.issueYear,
            };
          }),
        },
        {
          name: this.dialogData.oppositeChart.title,
          type: 'line',
          data: this.dialogData.list.map((item) => {
            return {
              y: this._getOppositeChartValue(item),
              x: this.months[item.issueMonth - 1] + ' - ' + item.issueYear,
            };
          }),
        },
      ]);
      const _minMaxAvg = minMaxAvg(this.dialogData.list.map((item) => this._getMainChartValue(item)));
      this.chart.updateOptions({
        colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
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
    this.dialogData.list.sort((a, b) => {
      if (a.issueYear !== b.issueYear) return a.issueYear - b.issueYear;
      return a.issueMonth - b.issueMonth;
    });
    const groupsObject = this.dialogData.list.reduce((acc, cur) => {
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

  private _getMainChartValue(item: { issueYear: number; issueMonth: number }) {
    const bindValue = this.dialogData.mainChart.bindValue;
    if (typeof bindValue === 'function') return bindValue(item);
    else return (item as any)[bindValue] as number;
  }

  private _getOppositeChartValue(item: { issueYear: number; issueMonth: number }) {
    const bindValue = this.dialogData.oppositeChart.bindValue;
    if (typeof bindValue === 'function') return bindValue(item);
    else return (item as any)[bindValue] as number;
  }
}
