import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';

export type ChartOptions = {
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  series: ApexAxisChartSeries;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  xaxis: ApexXAxis;
  yaxis?: ApexYAxis;
  colors: string[];
  tooltip: ApexTooltip;
  plotOptions?: ApexPlotOptions;
};
