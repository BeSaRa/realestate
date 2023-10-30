import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BezierInterpolation, Point } from 'rulyotano.math.interpolation.bezier';
import { minMaxAvg } from '@utils/utils';
import BezierCurve from 'rulyotano.math.interpolation.bezier/dist/src/BezierCurve';

@Component({
  selector: 'app-sell-forecasting-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sell-forecasting-chart.component.html',
  styleUrls: ['./sell-forecasting-chart.component.scss'],
})
export class SellForecastingChartComponent implements OnInit {
  realPoints = [new Point(2018, 824), new Point(2022, 680), new Point(2023, 750), new Point(2028, 1125)];
  minMaxYears = minMaxAvg(this.realPoints.map((p) => p.x));
  minMaxValues = minMaxAvg(this.realPoints.map((p) => p.y));
  viewPoints = this.realPoints.map((p) => {
    const _viewX = 10 + ((p.x - this.minMaxYears.min) / (this.minMaxYears.max - this.minMaxYears.min)) * 80;
    const _viewY = 60 - (p.y / this.minMaxValues.max) * 50;
    return new Point(_viewX, _viewY);
  });
  curves = BezierInterpolation.pointsToBezierCurves(this.viewPoints, false, 1).segments.map(
    (s) => new BezierCurve([s])
  );
  paths = this.curves.map((c) => c.toPath());
  ngOnInit(): void {}
}
