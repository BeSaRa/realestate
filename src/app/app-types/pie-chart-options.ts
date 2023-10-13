import {
  ApexChart,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexTooltip,
} from 'ng-apexcharts';

export interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  plotOptions?: ApexPlotOptions;
  chart: ApexChart;
  responsive?: ApexResponsive[];
  labels: string[];
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  colors?: string[] | ((value: number) => string)[];
}
