import { Injectable, inject } from '@angular/core';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { maskSeparator } from '@constants/mask-separator';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { formatNumber } from '@utils/utils';
import { NgxMaskPipe } from 'ngx-mask';
import { TranslationService } from './translation.service';
import { PieChartOptions } from '@app-types/pie-chart-options';

@Injectable({
  providedIn: 'root',
})
export class AppChartTypesService {
  lang = inject(TranslationService);
  maskPipe = inject(NgxMaskPipe);

  private _mainChartOptions: Partial<PartialChartOptions> = mainChartOptions;
  get mainChartOptions() {
    return structuredClone(this._mainChartOptions);
  }
  get yearlyStaticChartOptions() {
    return { tooltip: { marker: { fillColors: ['#259C80'] } } };
  }
  get halflyAndQuarterlyStaticChartOptions() {
    return {
      colors: ['#8A1538', '#A29475', '#C0C0C0', '#1A4161'],
      tooltip: { marker: { fillColors: ['#8A1538', '#A29475', '#C0C0C0', '#1A4161'] } },
    };
  }
  get monthlyStaticChartOptions() {
    return { tooltip: { marker: { fillColors: ['#259C80'] } } };
  }

  private _top10LineChartOptions = top10LineChartOptions;
  private _top10BarChartOptions = top10BarChartOptions;
  get top10ChartOptions() {
    return { line: structuredClone(this._top10LineChartOptions), bar: structuredClone(this._top10BarChartOptions) };
  }

  private _pieChartOptions = pieChartOptions;
  get pieChartOptions() {
    return structuredClone(this._pieChartOptions);
  }

  private _popupChartOptions = popupChartOptions;
  get popupChartOptions() {
    return structuredClone(this._popupChartOptions);
  }

  dataLabelsFormatter(root?: { hasPrice: boolean }): (val: string | number | number[], opts?: any) => string | number {
    return (val) => {
      return this._labelFormatter(val, root);
    };
  }

  axisXFormatter(root?: { hasPrice: boolean }): (value: string, timestamp?: number, opts?: any) => string | string[] {
    return (val) => {
      return this._labelFormatter(val, root);
    };
  }

  axisYFormatter(root?: { hasPrice: boolean }): (val: number, opts?: any) => string | string[] {
    return (val) => {
      return this._labelFormatter(val, root);
    };
  }

  popupLabelsFormatter(): (val: string | number | number[], opts?: any) => string | number {
    return (val, { seriesIndex }) => {
      if (typeof val === 'undefined') return val;
      if (typeof val === 'string' && (val as unknown as number) !== undefined && (val as unknown as number) !== null)
        return val;
      const value = val as unknown as number;
      return seriesIndex === 0
        ? (formatNumber(value) as string)
        : (this.maskPipe.transform(value.toFixed(0), maskSeparator.SEPARATOR, {
            thousandSeparator: ',',
          }) as unknown as string);
    };
  }

  legendFormatter(): (legendName: string, opts: any) => string {
    return (val, opts) => {
      return this.lang.getCurrent().direction === 'rtl'
        ? '( ' + opts.w.globals.series[opts.seriesIndex] + ' ) : ' + val
        : val + ' : ( ' + opts.w.globals.series[opts.seriesIndex] + ' )';
    };
  }

  chartColorsFormatter(minMaxAvg: MinMaxAvgContract) {
    return ({ value }: { value: number }): string => {
      if (value >= minMaxAvg.min && value < minMaxAvg.avg) return '#C0C0C0';
      if (value >= minMaxAvg.avg && value < minMaxAvg.max) return '#A29475';
      return '#8A1538';
    };
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
    style: { colors: ['#259C80'] },
  },
  stroke: {
    curve: 'smooth',
    // colors: ['#A29475'],
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'],
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
    max: (max: number) => max + 150,
    tickAmount: 10,
    labels: {
      // formatter: don't forget to set formatter when use chart
      minWidth: 50,
      style: {
        fontWeight: 'bold',
      },
    },
  },
  tooltip: { marker: { fillColors: ['#259C80'] } },
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
  colors: ['#60d39d'],
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
  colors: ['#60d39d'],
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
