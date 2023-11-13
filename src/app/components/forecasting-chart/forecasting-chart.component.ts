import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ForecastCriteriaContract, ForecastCriteriaItemContract } from '@contracts/forecast-criteria-contract';
import { ForecastData } from '@models/forecast-data';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { TranslationService } from '@services/translation.service';
import { minMaxAvg } from '@utils/utils';
import { BezierInterpolation, Point } from 'rulyotano.math.interpolation.bezier';
import BezierCurve from 'rulyotano.math.interpolation.bezier/dist/src/BezierCurve';
import { catchError, take, throwError } from 'rxjs';

@Component({
  selector: 'app-forecasting-chart',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './forecasting-chart.component.html',
  styleUrls: ['./forecasting-chart.component.scss'],
})
export class ForecastingChartComponent implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) rootData!: { chartDataUrl: string; hasPrice: boolean };
  @Input({ required: true }) filterCriteria!: CriteriaContract;
  @Input({ required: true }) forecastCriteriaItems: ForecastCriteriaItemContract[] = [];

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  appChartTypesService = inject(AppChartTypesService);

  realPoints = this._getInitialPoints();

  viewPoints = this._getViewPoints();
  svgPaths = this._getSvgPaths();

  isLoading = false;
  isCriteriaValid = true;
  isDataAvailable = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['rootData'] && changes['rootData'].currentValue !== changes['rootData'].previousValue) ||
      (changes['filterCriteria'] && changes['filterCriteria'].currentValue !== changes['filterCriteria'].previousValue)
    ) {
      if (!this.rootData || !this.filterCriteria) return;
      this.loadChartData();
    }
  }

  notChangeTrackBy() {
    return true;
  }

  loadChartData() {
    this.isCriteriaValid = true;
    this.isDataAvailable = true;

    this.forecastCriteriaItems.forEach((item) => {
      if (item.isArray) {
        const _arr = (this.filterCriteria[item.key as keyof CriteriaContract] as Array<number>) ?? [];
        if (_arr.length !== 1 || _arr.includes(-1)) {
          this.isCriteriaValid = false;
          return;
        }
      } else {
        if (this.filterCriteria[item.key as keyof CriteriaContract] === -1) {
          this.isCriteriaValid = false;
          return;
        }
      }
    });

    if (!this.isCriteriaValid) {
      this.realPoints = this._getInitialPoints();
      this.viewPoints = this._getViewPoints();
      this.svgPaths = this._getSvgPaths();
      return;
    }

    const _forecastCriteria: Partial<ForecastCriteriaContract> = {};
    this.forecastCriteriaItems.forEach((item) => {
      if (item.isArray)
        _forecastCriteria[item.forecastKey] = (
          this.filterCriteria[item.key as keyof CriteriaContract] as Array<number>
        )[0];
      else _forecastCriteria[item.forecastKey] = this.filterCriteria[item.key as keyof CriteriaContract] as number;
    });

    this.isLoading = true;
    this.dashboardService
      .loadForecastData(this.rootData.chartDataUrl, _forecastCriteria)
      .pipe(
        take(1),
        catchError((err) => {
          this.isLoading = false;
          this.isDataAvailable = false;
          return throwError(() => err);
        })
      )
      .subscribe((data) => {
        this.isLoading = false;

        if (!data.kpiPast || !data.kpiPreviousYear || !data.kpiCurrent || !data.kpiPredicated) {
          this.isDataAvailable = false;

          this.realPoints = this._getInitialPoints();
          this.viewPoints = this._getViewPoints();
          this.svgPaths = this._getSvgPaths();
          return;
        }

        this.realPoints = this._getPredictedPoints(data);
        this.viewPoints = this._getViewPoints();
        this.svgPaths = this._getSvgPaths();
      });
  }

  getFormattedValue(value: number) {
    return this.appChartTypesService.dataLabelsFormatter({ val: value }, this.rootData);
  }

  private _getInitialPoints() {
    return [new Point(2018, 0), new Point(2022, 0), new Point(2023, 0), new Point(2028, 0)];
  }

  private _getPredictedPoints(data: ForecastData) {
    return [
      new Point(2018, data.kpiPast ?? 0),
      new Point(2022, data.kpiPreviousYear ?? 0),
      new Point(2023, data.kpiCurrent ?? 0),
      new Point(2028, data.kpiPredicated ?? 0),
    ];
  }

  private _getViewPoints() {
    const _minMaxYears = minMaxAvg(this.realPoints.map((p) => p.x));
    const _minMaxValues = minMaxAvg(this.realPoints.map((p) => p.y));
    return this.realPoints.map((p) => {
      const _viewX = 5 + ((p.x - _minMaxYears.min) / (_minMaxYears.max - _minMaxYears.min)) * 90;
      const _viewY = _minMaxValues.max === 0 ? 45 : 50 - (p.y / _minMaxValues.max) * 40;
      return new Point(_viewX, _viewY);
    });
  }

  private _getSvgPaths() {
    return BezierInterpolation.pointsToBezierCurves(this.viewPoints, false, 1)
      .segments.map((s) => new BezierCurve([s]))
      .map((c) => c.toPath());
  }
}
