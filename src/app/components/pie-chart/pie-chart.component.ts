import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, QueryList, ViewChildren, inject } from '@angular/core';
import { PieChartOptions } from '@app-types/pie-chart-options';
import { CriteriaContract } from '@contracts/criteria-contract';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { KpiModel } from '@models/kpi-model';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { objectHasOwnProperty } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { Observable, combineLatest, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent extends OnDestroyMixin(class {}) implements AfterViewInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) filterCriteria$!: Observable<CriteriaContract | undefined>;
  @Input({ required: true }) rootData$!: Observable<{ chartDataUrl: string; hasPrice: boolean } | undefined>;
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input() bindValue: string | ((item: any) => number) = 'kpiVal';
  @Input() valueUnit?: string;

  @ViewChildren('pieChart') pieChart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  appChartTypesService = inject(AppChartTypesService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);

  criteria!: CriteriaContract;
  rootData!: { chartDataUrl: string; hasPrice: boolean };

  isLoading = false;

  pieChartOptions: PieChartOptions = {
    ...this.appChartTypesService.pieChartOptions,
    tooltip: {
      custom: (opts) => this.appChartTypesService.getPieCustomTooltip(opts, this.rootData.hasPrice, this.valueUnit),
    },
  };

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._listenToCriteriaAndRootChange();
    }, 0);
  }

  private _listenToCriteriaAndRootChange() {
    combineLatest([this.filterCriteria$, this.rootData$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([criteria, root]) => {
        if (!criteria || !root) return;
        this.criteria = criteria;
        this.rootData = root;
        this._updatePieChartData();
      });
  }

  private _updatePieChartData() {
    this.dashboardService
      .loadChartKpiData(this.rootData, this.criteria)
      .pipe(take(1))
      .subscribe((data) => {
        this.pieChart.first
          ?.updateOptions({
            series: data.map((item) => this._getValue(item)),
            labels: data.map((item) => this._getLabel(item)),
          })
          .then();
      });
  }

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
}
