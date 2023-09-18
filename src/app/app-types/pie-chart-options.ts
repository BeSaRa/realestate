import { ApexChart, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive } from 'ng-apexcharts';

export interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  plotOptions?: ApexPlotOptions;
  chart: ApexChart;
  responsive?: ApexResponsive[];
  labels: string[];
  legend?: ApexLegend;
  colors?: string[] | ((value: number) => string)[];
}
