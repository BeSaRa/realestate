import { Injectable, inject } from '@angular/core';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { maskSeparator } from '@constants/mask-separator';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { formatNumber } from '@utils/utils';
import { NgxMaskPipe } from 'ngx-mask';
import { TranslationService } from './translation.service';
import { PieChartOptions } from '@app-types/pie-chart-options';
import { ApexYAxis } from 'ng-apexcharts';
import { AppColors } from '@constants/app-colors';

@Injectable({
  providedIn: 'root',
})
export class AppChartTypesService {
  lang = inject(TranslationService);
  maskPipe = inject(NgxMaskPipe);

  private _mainChartOptions: Partial<PartialChartOptions> = mainChartOptions;
  get mainChartOptions() {
    return { ...this._mainChartOptions };
  }
  get yearlyStaticChartOptions() {
    return { tooltip: { marker: { fillColors: [AppColors.JUNGLE] } } };
  }
  get halflyAndQuarterlyStaticChartOptions() {
    return {
      colors: [AppColors.PRIMARY, AppColors.SECONDARY, AppColors.GRAY, AppColors.INDIGO_RAINBOW],
      tooltip: {
        marker: { fillColors: [AppColors.PRIMARY, AppColors.SECONDARY, AppColors.GRAY, AppColors.INDIGO_RAINBOW] },
      },
    };
  }
  get monthlyStaticChartOptions() {
    return { tooltip: { marker: { fillColors: [AppColors.JUNGLE] } } };
  }

  private _top10LineChartOptions = top10LineChartOptions;
  private _top10BarChartOptions = top10BarChartOptions;
  get top10ChartOptions(): { line: Partial<PartialChartOptions>; bar: Partial<PartialChartOptions> } {
    return { line: { ...this._top10LineChartOptions }, bar: { ...this._top10BarChartOptions } };
  }

  private _pieChartOptions = pieChartOptions;
  get pieChartOptions() {
    return { ...this._pieChartOptions, legend: { formatter: this.legendFormatter } };
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

  addDataLabelsFormatter(
    chartOptions: Partial<PartialChartOptions>,
    formatter: (val: string | number | number[], opts?: any) => string | number
  ) {
    return (chartOptions = { ...chartOptions, dataLabels: { ...chartOptions.dataLabels, formatter } });
  }

  addAxisYFormatter(
    chartOptions: Partial<PartialChartOptions>,
    formatter: (val: number, opts?: any) => string | string[]
  ) {
    return (chartOptions = {
      ...chartOptions,
      yaxis: {
        ...chartOptions.yaxis,
        labels: {
          ...(chartOptions.yaxis as ApexYAxis).labels,
          formatter,
        },
      },
    });
  }

  addAxisXFormatter(
    chartOptions: Partial<PartialChartOptions>,
    formatter: (val: string, timestamp?: number, opts?: any) => string | string[]
  ) {
    return (chartOptions = {
      ...chartOptions,
      xaxis: {
        ...chartOptions.xaxis,
        labels: {
          ...(chartOptions.xaxis as ApexYAxis).labels,
          formatter,
        },
      },
    });
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
}

const mainChartOptions: Partial<PartialChartOptions> = {
  series: [],
  chart: {
    height: 350,
    type: 'line',
  },
  dataLabels: {
    enabled: true,
    // formatter: don't forget to set formatter when use chart
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
  },
  plotOptions: {
    bar: {
      columnWidth: '40%',
    },
  },
  yaxis: {
    min: 0,
    max: (max: number) => 1.1 * max,
    // tickAmount: 10,
    labels: {
      // formatter: don't forget to set formatter when use chart
      minWidth: 50,
      style: {
        fontWeight: 'bold',
      },
    },
  },
  tooltip: { marker: { fillColors: [AppColors.JUNGLE] } },
};

const top10LineChartOptions: Partial<PartialChartOptions> = {
  series: [],
  chart: {
    type: 'line',
    height: 400,
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
      // formatter: don't forget to set formatter when use chart
    },
  },
  yaxis: {
    labels: {
      // formatter: don't forget to set formatter when use chart
      style: {
        fontFamily: 'inherit',
        fontSize: '15px',
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
    width: 480,
  },
  labels: [],
  series: [1, 2, 53, 69, 7],
  legend: {
    // formatter: don't forget to set legend formatter when use chart
  },
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
