import { Injectable, inject } from '@angular/core';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { PieChartOptions } from '@app-types/pie-chart-options';
import { AppColors } from '@constants/app-colors';
import { maskSeparator } from '@constants/mask-separator';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { BarChartTypes } from '@enums/bar-chart-type';
import { Breakpoints } from '@enums/breakpoints';
import { formatNumber } from '@utils/utils';
import { NgxMaskPipe } from 'ngx-mask';
import { TranslationService } from './translation.service';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { ServiceContract } from '@contracts/service-contract';
import { DurationSeriesDataContract } from '@contracts/duration-series-data-contract';
import { DurationEndpoints } from '@enums/durations';

@Injectable({
  providedIn: 'root',
})
export class AppChartTypesService extends RegisterServiceMixin(class {}) implements ServiceContract {
  serviceName = 'AppChartTypesService';

  lang = inject(TranslationService);
  maskPipe = inject(NgxMaskPipe);

  private _mainChartOptions: PartialChartOptions = mainChartOptions;
  get mainChartOptions() {
    return { ...this._mainChartOptions };
  }
  get yearlyStaticChartOptions() {
    return { tooltip: { marker: { fillColors: [AppColors.JUNGLE] } } };
  }
  get halflyAndQuarterlyStaticChartOptions() {
    return {
      colors: [
        AppColors.PRIMARY,
        AppColors.SECONDARY,
        AppColors.GRAY,
        AppColors.INDIGO_RAINBOW,
        AppColors.GREEN_LIGHT,
        AppColors.PRIMARY_LIGHT,
        AppColors.AZURE,
        AppColors.GRAY_TOO,
      ],
      tooltip: {
        marker: {
          fillColors: [
            AppColors.PRIMARY,
            AppColors.SECONDARY,
            AppColors.GRAY,
            AppColors.INDIGO_RAINBOW,
            AppColors.GREEN_LIGHT,
            AppColors.PRIMARY_LIGHT,
            AppColors.AZURE,
            AppColors.GRAY_TOO,
          ],
        },
      },
    };
  }
  get monthlyStaticChartOptions() {
    return { tooltip: { marker: { fillColors: [AppColors.JUNGLE] } } };
  }

  private _minMaxAvgBarChartOptions = minMaxAvgBarChartOptions;
  get minMaxAvgBarChartOptions() {
    return { ...this._minMaxAvgBarChartOptions };
  }

  private _top10LineChartOptions = top10LineChartOptions;
  private _top10BarChartOptions = top10BarChartOptions;
  get top10ChartOptions(): { line: Partial<PartialChartOptions>; bar: Partial<PartialChartOptions> } {
    return { line: { ...this._top10LineChartOptions }, bar: { ...this._top10BarChartOptions } };
  }

  private _pieChartOptions = pieChartOptions;
  get pieChartOptions() {
    return {
      ...this._pieChartOptions,
      legend: {
        formatter: this.legendFormatter,
      },
    };
  }

  private _popupChartOptions = popupChartOptions;
  get popupChartOptions() {
    return { ...this._popupChartOptions };
  }

  dataLabelsFormatter(
    value: { val: string | number | number[]; opts?: any },
    root?: { hasPrice: boolean }
  ): string | number {
    return this._labelFormatter(value.val, root);
  }

  axisXFormatter(
    value: { val: string; timestamp?: number; opts?: any },
    root?: { hasPrice: boolean }
  ): string | string[] {
    return this._labelFormatter(value.val, root);
  }

  axisYFormatter(value: { val: number; opts?: any }, root?: { hasPrice: boolean }): string | string[] {
    return this._labelFormatter(value.val, root);
  }

  popupLabelsFormatter = (val: string | number | number[], opts?: { seriesIndex: number }) => {
    if (typeof val === 'undefined') return val;
    if (typeof val === 'string' && (val as unknown as number) !== undefined && (val as unknown as number) !== null)
      return val;
    const value = val as unknown as number;
    return opts?.seriesIndex === 0
      ? (formatNumber(value) as string)
      : (this.maskPipe.transform(value.toFixed(0), maskSeparator.SEPARATOR, {
          thousandSeparator: ',',
        }) as unknown as string);
  };

  legendFormatter = (legendName: string, opts: any) => {
    return this.lang.getCurrent().direction === 'rtl'
      ? '( ' + opts.w.globals.series[opts.seriesIndex] + ' ) : ' + legendName
      : legendName + ' : ( ' + opts.w.globals.series[opts.seriesIndex] + ' )';
  };

  chartColorsFormatter(minMaxAvg: MinMaxAvgContract) {
    return ({ value }: { value: number }): string => {
      if (value >= minMaxAvg.min && value < minMaxAvg.avg) return AppColors.GRAY;
      if (value >= minMaxAvg.avg && value < minMaxAvg.max) return AppColors.SECONDARY;
      return AppColors.PRIMARY;
    };
  }

  getRangeOptions = getRangeOptions;

  getSplittedSeriesChartOptions(
    series: { name?: string; data: { y: number; x: number | string }[] }[],
    minMaxAvg: MinMaxAvgContract[]
  ): PartialChartOptions {
    const _colors: string[] = [];
    [AppColors.GRAY, AppColors.SECONDARY, AppColors.PRIMARY].forEach((c) => {
      for (let i = 0; i < series.length; i++) _colors.push(c);
    });
    const _newSeries: typeof series = [];
    series.forEach((s, index) =>
      _newSeries.push(...this.splitSeriesDataPointAccordingToMinMaxAvg(s, minMaxAvg[index]))
    );
    return {
      series: _newSeries,
      colors: _colors,
    };
  }

  splitSeriesDataPointAccordingToMinMaxAvg(
    series: { name?: string; data: { y: number; x: number | string }[] },
    minMaxAvg: MinMaxAvgContract
  ): { name?: string; data: { y: number; x: number | string }[] }[] {
    return [
      {
        name: series.name,
        data: series.data.map((item) => ({ x: item.x, y: item.y >= minMaxAvg.min ? minMaxAvg.min : item.y })),
      },
      {
        name: series.name,
        data: series.data.map((item) => ({
          x: item.x,
          y:
            item.y >= minMaxAvg.min
              ? item.y >= minMaxAvg.avg
                ? minMaxAvg.avg - minMaxAvg.min
                : item.y - minMaxAvg.min
              : 0,
        })),
      },
      {
        name: series.name,
        data: series.data.map((item) => ({ x: item.x, y: item.y >= minMaxAvg.avg ? item.y - minMaxAvg.avg : 0 })),
      },
    ];
  }

  getXAnnotaionForSelectedBar(text: string) {
    return {
      x: text,
      opacity: 1,
      borderColor: AppColors.SECONDARY,
      label: {
        text,
        orientation: 'horizontal',
        borderWidth: 0,
        borderRadius: 4,
        position: 'bottom',
        offsetY: 25,
        style: {
          background: AppColors.SECONDARY,
          color: '#ffffff',
          fontSize: '18px',
        },
      },
    };
  }

  durationCustomTooltip(
    opts: { seriesIndex: number; dataPointIndex: number },
    data: DurationSeriesDataContract[],
    durationType: DurationEndpoints,
    hasPrice: boolean,
    isMultiSeries: boolean
  ) {
    const _series = isMultiSeries ? data[opts.seriesIndex] : data[0];
    const _dataPoint = _series.data[opts.dataPointIndex];
    if (durationType === DurationEndpoints.MONTHLY || isMultiSeries) {
      return this._getDurationDefaultTemplate(_dataPoint.x, _dataPoint.y, _series.name ?? '', hasPrice);
    } else {
      return this._getDurationCustomTemplate(
        _dataPoint.x,
        _dataPoint.y,
        _dataPoint.yoy ?? 0,
        _dataPoint.baseYear ?? 2019,
        _dataPoint.yoyBase ?? 0,
        _series.name ?? '',
        hasPrice
      );
    }
  }

  private _labelFormatter(val: string | number | number[], root?: { hasPrice: boolean }) {
    if (typeof val === 'undefined') return val;
    if (typeof val === 'string' && (val as unknown as number) !== undefined && (val as unknown as number) !== null)
      return val;
    const value = val as unknown as number;
    return root?.hasPrice
      ? (formatNumber(value) as string)
      : (this.maskPipe.transform(value.toFixed(0), maskSeparator.SEPARATOR, {
          thousandSeparator: ',',
        }) as unknown as string);
  }

  private _getDurationDefaultTemplate(x: string | number, y: number, name: string, hasPrice: boolean) {
    return `
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">${x}</div>
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex">
        <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${name}: </span>
            <span class="apexcharts-tooltip-text-y-value">${this.axisYFormatter(
              {
                val: y,
              },
              { hasPrice }
            )}</span>
          </div>
        </div>
      </div>
    `;
  }

  private _getDurationCustomTemplate(
    x: string | number,
    y: number,
    yoy: number,
    baseYear: number,
    yoyBase: number,
    name: string,
    hasPrice: boolean
  ) {
    return `
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">${x}</div>
      <div dir="${
        this.lang.isLtr ? 'ltr' : 'rtl'
      }" class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex">
        <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px">
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${name}: </span>
            <span class="apexcharts-tooltip-text-y-value">${this.axisYFormatter(
              {
                val: y,
              },
              { hasPrice }
            )}</span>
          </div>
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${this.lang.map.annually}: </span>
            <span class="apexcharts-tooltip-text-y-value">${yoy.toFixed(1)}%</span>
          </div>
          <div class="apexcharts-tooltip-y-group flex justify-between gap-2">
            <span class="apexcharts-tooltip-text-y-label">${this.lang.map.vs} ${baseYear}: </span>
            <span class="apexcharts-tooltip-text-y-value">${yoyBase.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    `;
  }
}

const mainChartOptions: PartialChartOptions = {
  series: [],
  chart: {
    height: 350,
    type: 'line',
  },
  dataLabels: {
    enabled: true,
    enabledOnSeries: undefined,
    style: { colors: [AppColors.JUNGLE] },
  },
  stroke: {
    curve: 'smooth',
    // colors: [AppColors.SECONDARY],
  },
  grid: {
    row: {
      colors: [AppColors.GRAY_LIGHT, 'transparent'],
      opacity: 0.5,
    },
  },
  xaxis: {
    categories: [],
    labels: {
      trim: true,
      rotate: -45,
      rotateAlways: false,
    },
    tooltip: {
      enabled: false,
    },
  },

  plotOptions: {
    bar: {
      columnWidth: '80%',
    },
  },
  yaxis: {
    min: 0,
    max: (max) => max / 0.9,
    // tickAmount: 10,
    labels: {
      // formatter: don't forget to set formatter when use chart
      minWidth: 50,
      style: {
        fontWeight: 'bold',
      },
    },
    tooltip: {
      enabled: false,
    },
  },
  tooltip: { marker: { fillColors: [AppColors.JUNGLE] } },
};

const minMaxAvgBarChartOptions: Partial<PartialChartOptions> = {
  series: [],
  chart: {
    height: 350,
    type: 'line',
    stacked: true,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 0,
  },
  grid: {
    row: {
      colors: [AppColors.GRAY_LIGHT, 'transparent'],
      opacity: 0.5,
    },
  },
  xaxis: {
    categories: [],
    labels: {
      trim: true,
      rotate: -45,
      rotateAlways: false,
    },
    tooltip: {
      enabled: false,
    },
  },

  plotOptions: {
    bar: {
      columnWidth: '80%',
      dataLabels: {
        total: {
          enabled: true,
          style: { color: AppColors.JUNGLE },
        },
      },
    },
  },
  yaxis: {
    min: 0,
    max: (max) => max / 0.9,
    // tickAmount: 10,
    labels: {
      // formatter: don't forget to set formatter when use chart
      minWidth: 50,
      style: {
        fontWeight: 'bold',
      },
    },
    tooltip: {
      enabled: false,
    },
  },
  tooltip: { marker: { fillColors: [AppColors.JUNGLE] } },
  legend: { show: false },
};

const top10LineChartOptions: Partial<PartialChartOptions> = {
  series: [],
  chart: {
    type: 'line',
    height: 400,
    width: '100%',
  },
  dataLabels: {
    enabled: true,
    dropShadow: {
      enabled: true,
    },
    // formatter: don't forget to set formatter when use chart
  },
  stroke: {
    curve: 'smooth',
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
  },
  xaxis: {
    categories: [],
    labels: {
      trim: true,
      // formatter: don't forget to set formatter when use chart
    },
  },
  yaxis: {
    labels: {
      // formatter: don't forget to set formatter when use chart
      show: false,
      style: {
        fontFamily: 'inherit',
        fontSize: '12px',
      },
    },
  },
  colors: [AppColors.GREEN_LIGHT],
};

const top10BarChartOptions: Partial<PartialChartOptions> = {
  series: [],
  chart: {
    type: 'bar',
    height: 400,
    width: '100%',
  },
  dataLabels: {
    enabled: true,
    dropShadow: {
      enabled: true,
    },
    // formatter: don't forget to set formatter when use chart
  },
  stroke: {
    curve: 'smooth',
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
  },
  xaxis: {
    categories: [],
    labels: {
      show: false,
      // formatter: don't forget to set formatter when use chart
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      columnWidth: '20%',
      dataLabels: {
        position: 'bottom',
      },
    },
  },
  yaxis: {
    reversed: true,

    labels: {
      // formatter: don't forget to set formatter when use chart
      maxWidth: 100,
      style: {
        fontFamily: 'inherit',
        fontSize: '15px',
      },
    },
  },
  colors: [AppColors.GREEN_LIGHT],
};

const pieChartOptions: PieChartOptions = {
  chart: {
    type: 'pie',
    width: '100%',
  },
  labels: [],
  series: [1, 2, 53, 69, 7],

  colors: [
    AppColors.PRIMARY,
    AppColors.SECONDARY,
    AppColors.GRAY_TOO,
    AppColors.INDIGO_RAINBOW,
    AppColors.JUNGLE,
    AppColors.AZURE,
    AppColors.SAND,
    AppColors.GRAY,
    AppColors.GREEN_LIGHT,
    AppColors.GRAY_LIGHT,
    AppColors.PRIMARY_LIGHT,
  ],

  responsive: [
    {
      breakpoint: 2000,
      options: {
        chart: {
          width: 450,
        },
        legend: {
          // show: false,
          position: 'bottom',
          horizontalAlign: 'center',
          width: '100%',
        },
      },
    },
  ],
};

const popupChartOptions: Partial<PartialChartOptions> = {
  series: [],
  chart: {
    type: 'line',
    height: 350,
    width: 600,
  },
  // title: {
  //   text: this.lang.map.year + ' : ' + this.data[0].issueYear.toString(),
  //   align: 'center',
  //   floating: true,
  //   style: {
  //     fontFamily: 'inherit',
  //   },
  // },
  plotOptions: {},

  dataLabels: {
    enabled: true,
    // formatter: don't forget to set formatter to popup labels formatter when use chart
  },
  yaxis: [
    {
      title: {
        // text: don't forget to add yaxis title
      },
      labels: {
        // formatter: don't forget to add pricefull formatter
      },
    },
    {
      opposite: true,
      title: {
        // text: don't forget to add yaxis title
      },
      labels: {
        // formatter: don't forget to add priceless formatter
      },
    },
  ],
  xaxis: {
    tickPlacement: 'between',
    labels: {
      formatter: function (val: string) {
        if (typeof val === 'string') {
          const index = val.indexOf(' - ');
          return val.slice(0, index);
        }
        return '';
      },
    },
    group: {
      style: { fontSize: '16px', fontWeight: 700 },
      // groups: don't forget to add groups
    },
  },
};

function getRangeOptions(
  screenSize: Breakpoints,
  barChartType: BarChartTypes,
  dataCount: number,
  isStacked = false
): PartialChartOptions {
  function getRange(defaultRange: number) {
    return dataCount <= defaultRange ? (dataCount <= 3 ? dataCount : dataCount - 1) : defaultRange;
  }

  let _range = 0;

  if (barChartType === BarChartTypes.SINGLE_BAR) {
    switch (screenSize) {
      case Breakpoints.XS:
        _range = getRange(4);
        break;
      case Breakpoints.SM:
        _range = getRange(8);
        break;
      case Breakpoints.MD:
        _range = getRange(12);
        break;
      case Breakpoints.LG:
        _range = getRange(16);
        break;
      case Breakpoints.XL:
        _range = getRange(20);
        break;
      case Breakpoints.XL2:
        _range = getRange(25);
        break;
    }
  } else if (barChartType === BarChartTypes.DOUBLE_BAR) {
    switch (screenSize) {
      case Breakpoints.XS:
        _range = getRange(3);
        break;
      case Breakpoints.SM:
        _range = getRange(6);
        break;
      case Breakpoints.MD:
        _range = getRange(9);
        break;
      case Breakpoints.LG:
        _range = getRange(12);
        break;
      case Breakpoints.XL:
        _range = getRange(15);
        break;
      case Breakpoints.XL2:
        _range = getRange(20);
        break;
    }
  } else {
    switch (screenSize) {
      case Breakpoints.XS:
        _range = getRange(3);
        break;
      case Breakpoints.SM:
        _range = getRange(4);
        break;
      case Breakpoints.MD:
        _range = getRange(6);
        break;
      case Breakpoints.LG:
        _range = getRange(8);
        break;
      case Breakpoints.XL:
        _range = getRange(10);
        break;
      case Breakpoints.XL2:
        _range = getRange(12);
        break;
    }
  }
  const returned = {
    xaxis: { range: _range },
    plotOptions: {
      bar: {
        columnWidth: isStacked
          ? '50%'
          : dataCount <= _range + 1
          ? '30%'
          : Math.round((dataCount / _range / 1.5) * 100).toString() + '%',
      },
    },
  };
  return returned;
}
