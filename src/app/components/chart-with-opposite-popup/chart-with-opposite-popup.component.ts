import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { AppColors } from '@constants/app-colors';
import { ScreenBreakpoints } from '@constants/screen-breakpoints';
import { ChartWithOppositePopupData } from '@contracts/chart-with-opposite-popup-data';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { TranslationService } from '@services/translation.service';
import { minMaxAvg } from '@utils/utils';
import { ApexYAxis, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-popup-opposite-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatNativeDateModule, IconButtonComponent, ButtonComponent],
  providers: [NgxMaskPipe],
  templateUrl: './chart-with-opposite-popup.component.html',
  styleUrls: ['./chart-with-opposite-popup.component.scss'],
})
export class ChartWithOppositePopupComponent implements OnInit, AfterViewInit {
  @ViewChild(ChartComponent)
  chart!: ChartComponent;

  lang = inject(TranslationService);
  adapter = inject(DateAdapter);
  appChartTypesService = inject(AppChartTypesService);
  breakpointObserverService = inject(BreakpointObserver);

  popupData: ChartWithOppositePopupData<{ issueYear: number; issueMonth: number }> = inject(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef);

  months: string[] = [];

  maskPipe = inject(NgxMaskPipe);

  chartOptions: Partial<PartialChartOptions> = this.appChartTypesService.popupChartOptions;

  ngOnInit(): void {
    this.chartOptions = {
      ...this.chartOptions,
      chart: {
        ...this.chartOptions.chart!,
        width: this._getChartWidth(),
      },
      dataLabels: {
        ...this.chartOptions.dataLabels,
        enabledOnSeries: [0],
        formatter: this.appChartTypesService.popupLabelsFormatter,
      },
      yaxis: [
        {
          ...(this.chartOptions.yaxis as ApexYAxis[])[0],
          title: { ...(this.chartOptions.yaxis as ApexYAxis[])[0].title, text: this.popupData.mainChart.title },
          labels: {
            ...(this.chartOptions.yaxis as ApexYAxis[])[0].labels,
            formatter: (val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, { hasPrice: true }),
          },
        },
        {
          ...(this.chartOptions.yaxis as ApexYAxis[])[1],
          title: { ...(this.chartOptions.yaxis as ApexYAxis[])[1].title, text: this.popupData.oppositeChart.title },
          labels: {
            ...(this.chartOptions.yaxis as ApexYAxis[])[1].labels,
            formatter: (val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, { hasPrice: false }),
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
          name: this.popupData.mainChart.title,
          type: 'column',
          data: this.popupData.list.map((item) => {
            return {
              y: this._getMainChartValue(item),
              x: this.months[item.issueMonth - 1] + ' - ' + item.issueYear,
            };
          }),
        },
        {
          name: this.popupData.oppositeChart.title,
          type: 'line',
          data: this.popupData.list.map((item) => {
            return {
              y: this._getOppositeChartValue(item),
              x: this.months[item.issueMonth - 1] + ' - ' + item.issueYear,
            };
          }),
          color: AppColors.SECONDARY,
        },
      ]);
      // const _minMaxAvg = minMaxAvg(this.popupData.list.map((item) => this._getMainChartValue(item)));
      this.chart.updateOptions({
        // colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
        colors: [AppColors.PRIMARY],
        tooltip: {
          shared: true,
          intersect: false,
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
    this.popupData.list.sort((a, b) => {
      if (a.issueYear !== b.issueYear) return a.issueYear - b.issueYear;
      return a.issueMonth - b.issueMonth;
    });
    const groupsObject = this.popupData.list.reduce((acc, cur) => {
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
    const bindValue = this.popupData.mainChart.bindValue;
    if (typeof bindValue === 'function') return bindValue(item);
    else return (item as any)[bindValue] as number;
  }

  private _getOppositeChartValue(item: { issueYear: number; issueMonth: number }) {
    const bindValue = this.popupData.oppositeChart.bindValue;
    if (typeof bindValue === 'function') return bindValue(item);
    else return (item as any)[bindValue] as number;
  }

  private _getChartWidth() {
    return this.breakpointObserverService.isMatched(ScreenBreakpoints.xs) ? 350 : 700;
  }
}
