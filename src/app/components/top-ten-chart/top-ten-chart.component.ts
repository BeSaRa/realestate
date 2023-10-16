import { Component, Input, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lookup } from '@models/lookup';
import { CriteriaContract } from '@contracts/criteria-contract';
import { Observable } from 'rxjs';
import { ChartComponent } from 'ng-apexcharts';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { objectHasOwnProperty } from '@utils/utils';
import { ChartType } from '@enums/chart-type';
import { ChartOptionsModel } from '@models/chart-options-model';

@Component({
  selector: 'app-top-ten-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-ten-chart.component.html',
  styleUrls: ['./top-ten-chart.component.scss'],
})
export class TopTenChartComponent implements OnInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) filterCriteria$!: Observable<CriteriaContract | undefined>;
  @Input({ required: true }) selectedAccordingTo!: Lookup;
  @Input() accordingToList: Lookup[] = [];
  @Input() showSelectChartType = true;
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input() bindValue: string | ((item: any) => number) = 'kpiVal';

  @ViewChildren('chart') chart!: QueryList<ChartComponent>;

  appChartTypesService = inject(AppChartTypesService);
  dashboardService = inject(DashboardService);

  isLoading = false;

  protected readonly ChartType = ChartType;

  chartOptions = {
    bar: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.bar),
    line: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.line),
  };

  ngOnInit(): void {
    this._initializeChartFormatters();
  }

  onAccordingToChange(_new: Lookup) {
    this.selectedAccordingTo = _new;
  }

  updateChart() {}

  private _getValue(item: unknown): number {
    return this.bindValue && typeof this.bindValue === 'string'
      ? typeof (item as never)[this.bindValue] === 'function'
        ? ((item as never)[this.bindValue] as () => number)()
        : objectHasOwnProperty(item, this.bindValue)
        ? (item[this.bindValue] as number)
        : (item as unknown as number)
      : this.bindValue && typeof this.bindValue === 'function'
      ? (this.bindValue(item) as number)
      : (item as unknown as number);
  }

  private _getLabel(item: unknown): string {
    return this.bindLabel && typeof this.bindLabel === 'string'
      ? typeof (item as never)[this.bindLabel] === 'function'
        ? ((item as never)[this.bindLabel] as () => string)()
        : objectHasOwnProperty(item, this.bindLabel)
        ? (item[this.bindLabel] as string)
        : (item as unknown as string)
      : this.bindLabel && typeof this.bindLabel === 'function'
      ? (this.bindLabel(item) as string)
      : (item as unknown as string);
  }

  private _initializeChartFormatters() {
    [this.chartOptions.line, this.chartOptions.bar].forEach((chart) => {
      chart
        .addDataLabelsFormatter((val, opts) =>
          this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.selectedAccordingTo)
        )
        .addAxisYFormatter((val, opts) =>
          this.appChartTypesService.axisYFormatter({ val, opts }, this.selectedAccordingTo)
        )
        .addAxisXFormatter((val, opts) =>
          this.appChartTypesService.axisXFormatter({ val, opts }, this.selectedAccordingTo)
        );
    });
  }
}
