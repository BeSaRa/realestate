import { PartialChartOptions } from '@app-types/partialChartOptions';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { isArray } from '@utils/utils';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexLegend,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexPlotOptions,
  ApexFill,
} from 'ng-apexcharts';

export class ChartOptionsModel extends ClonerMixin(class {}) implements PartialChartOptions {
  series?: ApexAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  stroke?: ApexStroke;
  dataLabels?: ApexDataLabels;
  markers?: ApexMarkers;
  colors?: string[] | ((value: number) => string)[];
  yaxis?: ApexYAxis | ApexYAxis[];
  grid?: ApexGrid;
  legend?: ApexLegend;
  title?: ApexTitleSubtitle;
  tooltip?: ApexTooltip;
  plotOptions?: ApexPlotOptions;
  fill?: ApexFill;

  addDataLabelsFormatter(formatter: (val: string | number | number[], opts?: any) => string | number) {
    this.dataLabels = { ...this.dataLabels, formatter };
    return this;
  }

  addAxisYFormatter(formatter: (val: number, opts?: any) => string | string[]) {
    if (isArray(this.yaxis)) {
      this.yaxis = this.yaxis.map((item) => ({ ...item, labels: { ...item.labels, formatter } }));
    } else {
      this.yaxis = { ...this.yaxis, labels: { ...this.yaxis?.labels, formatter } };
    }
    return this;
  }

  addAxisXFormatter(formatter: (val: string, timestamp?: number, opts?: any) => string | string[]) {
    this.xaxis = {
      ...this.xaxis,
      labels: { ...this.xaxis?.labels, formatter },
    };
    return this;
  }

  addLegendFormatter(formatter: (legendName: string, opts: any) => string) {
    this.legend = { ...this.legend, formatter };
    return this;
  }
}
