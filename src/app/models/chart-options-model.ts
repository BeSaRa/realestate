import { PartialChartOptions } from '@app-types/partialChartOptions';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { isArray } from '@utils/utils';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartType,
} from 'ng-apexcharts';

export interface ChartContext {
  w: {
    config: Required<PartialChartOptions>;
  };
}

export interface DataPointSelectionConfig {
  dataPointIndex: number;
  selectedDataPoints: number[][];
  seriesIndex: number;
  w: {
    config: Required<PartialChartOptions>;
  };
}

export interface ChartConfig {
  config: Required<PartialChartOptions> & { labels: string[] };
  globals: { selectedDataPoints: number[][] };
}

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

  addAnimationEndCallback(callback: (chartContext: any, options: any) => void) {
    this.chart = {
      ...(this.chart ?? {}),
      type: this.chart?.type ?? 'bar',
      events: { ...(this.chart?.events ?? {}), animationEnd: callback },
    };
    return this;
  }

  addUpdatedCallback(callback: (chartContext: ChartContext, config: ChartConfig) => void) {
    this.chart = {
      ...(this.chart ?? {}),
      type: this.chart?.type ?? 'bar',
      events: { ...(this.chart?.events ?? {}), updated: callback },
    };
    return this;
  }

  addDataPointSelectionCallback(
    callback: (event: MouseEvent, chartContext: ChartContext, config: DataPointSelectionConfig) => void
  ) {
    this.chart = {
      ...(this.chart ?? {}),
      type: this.chart?.type ?? 'bar',
      events: { ...(this.chart?.events ?? {}), dataPointSelection: callback },
    };
    return this;
  }

  updateChartType(chartType: ChartType) {
    this.chart && (this.chart.type = chartType);
    return this;
  }

  setChartHeight(height: number) {
    this.chart && (this.chart.height = height);
    return this;
  }

  addCustomToolbarOptions() {
    this.chart = {
      ...(this.chart ?? {}),
      type: this.chart?.type ?? 'bar',
      toolbar: {
        show: true,
        tools: {
          selection: false,
          zoom: false,
          download: true,
          zoomin:
            '<img class="hover:invert-[0.5]" title="scroll left" src="assets/icons/chart/chevron-left-circle-outline.svg">',
          zoomout:
            '<img class="hover:invert-[0.5]" title="scroll right" src="assets/icons/chart/chevron-right-circle-outline.svg">',
          pan: true,
          reset: false,
        },
      },
    };
    return this;
  }

  addCustomTooltip(
    customTooltip: (opts: { seriesIndex: number; dataPointIndex: number }) => string | undefined,
    isShared: boolean
  ) {
    this.tooltip = {
      ...(this.tooltip ?? {}),
      shared: isShared,
      custom: customTooltip,
    };
    return this;
  }
}
