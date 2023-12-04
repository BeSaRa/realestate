import { CommonModule } from '@angular/common';
import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren,
  effect,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { ChartType } from '@enums/chart-type';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChartOptionsModel } from '@models/chart-options-model';
import { Top10AccordingTo } from '@models/top-10-according-to';
import { Top10KpiModel } from '@models/top-10-kpi-model';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { objectHasOwnProperty } from '@utils/utils';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { catchError, take, throwError } from 'rxjs';

@Component({
  selector: 'app-top-ten-chart',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconButtonComponent,
    NgApexchartsModule,
    MatProgressSpinnerModule,
    CustomTooltipDirective,
  ],
  templateUrl: './top-ten-chart.component.html',
  styleUrls: ['./top-ten-chart.component.scss'],
})
export class TopTenChartComponent extends OnDestroyMixin(class {}) implements OnInit, OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) selectedAccordingTo!: Top10AccordingTo;
  @Input() accordingToList: Top10AccordingTo[] = [];
  @Input() showSelectChartType = true;
  @Input({ required: true }) bindLabel!: string | ((item: any) => string);
  @Input() bindValue: string | ((item: any) => number) = 'getKpiVal';

  @ViewChildren('chart') chart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  appChartTypesService = inject(AppChartTypesService);
  dashboardService = inject(DashboardService);
  unitsService = inject(UnitsService);
  injector = inject(Injector);

  isLoading = false;

  protected readonly ChartType = ChartType;

  selectedChartType: 'line' | 'bar' = ChartType.BAR;
  chartData: Top10KpiModel[] = [];
  prevAccordingTo!: Top10AccordingTo;

  chartOptions = {
    bar: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.bar),
    line: new ChartOptionsModel().clone<ChartOptionsModel>(this.appChartTypesService.top10ChartOptions.line),
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue) {
      setTimeout(() => {
        if (!this.selectedAccordingTo.criteriaTerms.validate(this.criteria)) {
          for (let i = 0; i < this.accordingToList.length; i++) {
            if (this.accordingToList[i].criteriaTerms.validate(this.criteria)) {
              this.selectedAccordingTo = this.accordingToList[i];
              break;
            }
          }
        }
        this.updateChartData();
      }, 0);
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      this._initializeChartFormatters();
      this._listenToUnitChange();
    }, 0);
  }

  selectAccordingTo(_new: Top10AccordingTo) {
    if (_new.disabled || !_new.criteriaTerms.validate(this.criteria)) return;

    this.selectedAccordingTo = _new;
    this.updateChartData();
  }

  updateChartType(type: ChartType) {
    this.selectedChartType = type as 'line' | 'bar';
    this.chart.first.updateOptions(this.chartOptions[this.selectedChartType], true);
    this._updateOptions();
  }

  updateChartData() {
    this.isLoading = true;
    this.prevAccordingTo = this.selectedAccordingTo;

    this.dashboardService
      .loadTop10ChartData({ chartDataUrl: this.selectedAccordingTo.url }, this.criteria)
      .pipe(
        take(1),
        catchError((err) => {
          this.isLoading = false;
          this.selectedAccordingTo = this.prevAccordingTo;
          return throwError(() => err);
        })
      )
      .subscribe((data) => {
        this.chartData = data;
        this._updateOptions();
      });
  }

  private _updateOptions(): void {
    this.isLoading = false;
    setTimeout(() => {
      this.chart.first
        .updateOptions({
          series: [
            {
              name: this.selectedAccordingTo.getNames(),
              data: this.chartData.map((item) => {
                return { x: this._getLabel(item), y: this._getValue(item) };
              }),
            },
          ],
          plotOptions: {
            bar: {
              barHeight: 25,
            },
          },
        })
        .then();
    }, 0);
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

  private _listenToUnitChange() {
    runInInjectionContext(this.injector, () =>
      effect(() => {
        this.unitsService.selectedUnit();
        if (this.selectedAccordingTo.hasSqUnit) this._updateOptions();
      })
    );
  }
}
