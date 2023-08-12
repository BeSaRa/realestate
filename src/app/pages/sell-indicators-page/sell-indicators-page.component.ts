import { CommonModule } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PropertyBlockComponent } from '@components/property-block/property-block.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { ChartType } from '@enums/chart-type';
import { CriteriaType } from '@enums/criteria-type';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { SellDefaultValues } from '@models/sell-default-values';
import { SellTop10Model } from '@models/sell-top-10-model';
import { SellTransaction } from '@models/sell-transaction';
import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { formatNumber } from '@utils/utils';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel2';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { ReplaySubject, Subject, forkJoin, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sell-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    KpiRootComponent,
    PurposeComponent,
    IvyCarouselModule,
    PropertyBlockComponent,
    ButtonComponent,
    IconButtonComponent,
    NgApexchartsModule,
    TableComponent,
    TableColumnTemplateDirective,
    MatTableModule,
    FormatNumbersPipe,
  ],
  templateUrl: './sell-indicators-page.component.html',
  styleUrls: ['./sell-indicators-page.component.scss'],
})
export default class SellIndicatorsPageComponent implements OnInit {
  @ViewChildren('carousel') carousel!: QueryList<CarouselComponent>;
  @ViewChildren('chart') chart!: QueryList<ChartComponent>;
  @ViewChildren('top10Chart') top10Chart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  destroy$ = new Subject<void>();

  municipalities = this.lookupService.sellLookups.municipalityList;
  propertyTypes = this.lookupService.sellLookups.propertyTypeList;
  propertyUsages = this.lookupService.sellLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  zones = this.lookupService.sellLookups.zoneList;
  rooms = this.lookupService.sellLookups.rooms;

  purposeKPIS = this.lookupService.sellLookups.rentPurposeList;
  propertiesKPIS = this.lookupService.sellLookups.propertyTypeList;

  criteria!: {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  rootKPIS = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('the_total_number_of_sell_contracts'),
      this.lang.getEnglishTranslation('the_total_number_of_sell_contracts'),
      false,
      this.urlService.URLS.SELL_KPI1,
      this.urlService.URLS.SELL_KPI2,
      this.urlService.URLS.SELL_KPI3,
      this.urlService.URLS.SELL_KPI19
    ),
    new KpiRoot(
      4,
      this.lang.getArabicTranslation('the_total_number_of_properties_units_sold'),
      this.lang.getEnglishTranslation('the_total_number_of_properties_units_sold'),
      false,
      this.urlService.URLS.SELL_KPI4,
      this.urlService.URLS.SELL_KPI5,
      this.urlService.URLS.SELL_KPI6,
      this.urlService.URLS.SELL_KPI20
    ),

    new KpiRoot(
      10,
      this.lang.getArabicTranslation('total_sold_areas'),
      this.lang.getEnglishTranslation('total_sold_areas'),
      false,
      this.urlService.URLS.SELL_KPI10,
      this.urlService.URLS.SELL_KPI11,
      this.urlService.URLS.SELL_KPI12,
      this.urlService.URLS.SELL_KPI22
    ),
    new KpiRoot(
      7,
      this.lang.getArabicTranslation('the_total_value_of_sell_contracts'),
      this.lang.getEnglishTranslation('the_total_value_of_sell_contracts'),
      true,
      this.urlService.URLS.SELL_KPI7,
      this.urlService.URLS.SELL_KPI8,
      this.urlService.URLS.SELL_KPI9,
      this.urlService.URLS.SELL_KPI21
    ),
    new KpiRoot(
      16,
      this.lang.getArabicTranslation('sell_average_price_per_square_meter_square_foot'),
      this.lang.getEnglishTranslation('sell_average_price_per_square_meter_square_foot'),
      true,
      this.urlService.URLS.SELL_KPI16,
      this.urlService.URLS.SELL_KPI17,
      this.urlService.URLS.SELL_KPI18,
      this.urlService.URLS.SELL_KPI24
    ),
    new KpiRoot(
      13,
      this.lang.getArabicTranslation('average_sell_price_per_unit_property'),
      this.lang.getEnglishTranslation('average_sell_price_per_unit_property'),
      true,
      this.urlService.URLS.SELL_KPI13,
      this.urlService.URLS.SELL_KPI14,
      this.urlService.URLS.SELL_KPI15,
      this.urlService.URLS.SELL_KPI23
    ),
  ];

  selectedRoot?: KpiRoot;
  selectedPurpose?: Lookup = this.lookupService.sellLookups.rentPurposeList[0];

  get priceList() {
    return this.rootKPIS.filter((item) => item.hasPrice);
  }

  get nonePriceList() {
    return this.rootKPIS.filter((item) => !item.hasPrice);
  }

  accordingToList: Lookup[] = [
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('number_of_sell_contracts'),
      enName: this.lang.getEnglishTranslation('number_of_sell_contracts'),
      selected: true,
      url: this.urlService.URLS.SELL_KPI30,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('average_price_per_unit'),
      enName: this.lang.getEnglishTranslation('average_price_per_unit'),
      url: this.urlService.URLS.SELL_KPI31,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('transactions_value'),
      enName: this.lang.getEnglishTranslation('transactions_value'),
      url: this.urlService.URLS.SELL_KPI32,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('sold_areas'),
      enName: this.lang.getEnglishTranslation('sold_areas'),
      url: this.urlService.URLS.SELL_KPI33,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('number_of_units'),
      enName: this.lang.getEnglishTranslation('number_of_units'),
      url: this.urlService.URLS.SELL_KPI33_1,
    }),
    new Lookup().clone<Lookup>({
      arName: this.lang.getArabicTranslation('average_price_per_square_meter'),
      enName: this.lang.getEnglishTranslation('average_price_per_square_meter'),
      url: this.urlService.URLS.SELL_KPI33_2,
    }),
  ];

  protected readonly ChartType = ChartType;
  selectedChartType: ChartType = ChartType.LINE;
  selectedRootChartData!: KpiModel[];
  chartOptions: Partial<PartialChartOptions> = {
    series: [],
    chart: {
      height: 350,
      type: 'line',
    },
    dataLabels: {
      enabled: true,
      formatter(val: number): string | number {
        return formatNumber(val) as string;
      },
      background: { foreColor: '#ffffff' },
      style: { colors: ['#A29475'] },
    },
    stroke: {
      curve: 'smooth',
      colors: ['#A29475'],
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
        columnWidth: '20%',
      },
    },
    yaxis: {
      min: 0,
      max: (max: number) => max + 150,
      tickAmount: 10,
      labels: {
        formatter(val: number): string | string[] {
          return formatNumber(val) as string;
        },
        minWidth: 50,
      },
    },
    tooltip: { marker: { fillColors: ['#A29475'] } },
    colors: ['#A29475'],
  };

  transactions = new ReplaySubject<SellTransaction[]>(1);

  transactionsPurpose: SellTransactionPurpose[] = [];
  transactionsPurposeColumns = ['purpose', 'count', 'average', 'chart'];

  top10ChartData: SellTop10Model[] = [];
  selectedTop10: Lookup = this.accordingToList[0];
  top10ChartOptions: Partial<PartialChartOptions> = {
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
      formatter(val: number): string | number {
        return formatNumber(val) as string;
      },
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
        formatter(value: string): string | string[] {
          return formatNumber(value as unknown as number) as string;
        },
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
        formatter(val: number): string | string[] {
          return formatNumber(val) as string;
        },
        style: {
          fontFamily: 'inherit',
          fontSize: '15px',
        },
      },
    },
    colors: ['#60d39d'],
  };

  selectedTab = 'sell_indicators';

  ngOnInit(): void {}

  switchTab(tab: string): void {
    this.selectedTab = tab;
    this.carousel.setDirty();
    this.chart.setDirty();
    this.top10Chart.setDirty();
    setTimeout(() => {
      this.updateChart();
      this.updateTop10Chart();
    });
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };
    if (type === CriteriaType.DEFAULT) {
      // load default
      this.dashboardService.loadSellDefaults(criteria as Partial<SellCriteriaContract>).subscribe((result) => {
        this.setDefaultRoots(result[0]);
        this.rootItemSelected(this.rootKPIS[0]);
        this.selectTop10Chart(this.selectedTop10);
      });
    } else {
      this.rootKPIS.map((item) => {
        this.dashboardService
          .loadKpiRoot(item, this.criteria.criteria)
          .pipe(take(1))
          .subscribe((value) => {
            if (!value.length) {
              item.setValue(0);
              item.setYoy(0);
            } else {
              item.setValue(value[value.length - 1].kpiVal);
              item.setYoy(value[value.length - 1].kpiYoYVal);
            }
          });
      });

      this.rootItemSelected(this.selectedRoot);
      this.selectTop10Chart(this.selectedTop10);
    }
    this.loadTransactions();
    this.loadTransactionsBasedOnPurpose();
  }

  private setDefaultRoots(sellDefaultValue?: SellDefaultValues) {
    if (!sellDefaultValue) {
      this.rootKPIS.forEach((item) => {
        item.setValue(0);
        item.setYoy(0);
      });
    } else {
      this.rootKPIS.forEach((item) => {
        const value = `kpi${item.id}Val`;
        const yoy = `kpiYoY${item.id}`;
        item.setValue(sellDefaultValue[value as keyof SellDefaultValues]);
        item.setYear(sellDefaultValue.issueYear);
        item.setYoy(sellDefaultValue[yoy as keyof SellDefaultValues]);
      });
    }
  }

  rootItemSelected(item?: KpiRoot) {
    if (!item) return;
    this.selectedRoot = item;
    this.rootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    forkJoin([
      this.dashboardService.loadPurposeKpi(item, this.criteria.criteria),
      this.dashboardService.loadLineChartKpi(item, this.criteria.criteria),
    ]).subscribe(([subKPI, lineChartData]) => {
      this.selectedRootChartData = lineChartData;
      const purpose = subKPI.reduce((acc, item) => {
        return { ...acc, [item.purposeId]: item };
      }, {} as Record<number, KpiModel>);

      this.purposeKPIS = this.purposeKPIS.map((item) => {
        Object.prototype.hasOwnProperty.call(purpose, item.lookupKey)
          ? (item.value = purpose[item.lookupKey].kpiVal)
          : (item.value = 0);
        Object.prototype.hasOwnProperty.call(purpose, item.lookupKey)
          ? (item.yoy = purpose[item.lookupKey].kpiYoYVal)
          : (item.yoy = 0);
        return item;
      });
      this.selectedRoot && this.updateAllPurpose(this.selectedRoot.value, this.selectedRoot.yoy);
      this.selectedPurpose && this.purposeSelected(this.selectedPurpose);
      this.updateChart();
      this.updateTop10Chart();
    });
  }

  updateAllPurpose(value: number, yoy: number): void {
    const lookup = this.purposeKPIS.find((i) => i.lookupKey === -1);
    lookup && (lookup.value = value) && (lookup.yoy = yoy);
  }

  purposeSelected(item: Lookup) {
    this.purposeKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.selectedPurpose = item;

    this.selectedRoot &&
      this.dashboardService
        .loadPropertyTypeKpi(this.selectedRoot, {
          ...this.criteria.criteria,
          purposeList: [item.lookupKey],
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          this.propertiesKPIS = this.propertiesKPIS
            .map((item) => {
              const subItem = result.find((i) => i.propertyTypeId === item.lookupKey);
              subItem ? (item.value = subItem.kpiVal) : (item.value = 0);
              subItem ? (item.yoy = subItem.kpiYoYVal) : (item.yoy = 0);
              return item;
            })
            .sort((a, b) => a.value - b.value);
          this.goToFirstCell();
        });
  }

  private goToFirstCell(): void {
    if (!this.carousel.length) return;
    this.carousel.first.cellsToScroll = this.carousel.first.cellLength;
    this.carousel.first.next();
    this.carousel.first.cellsToScroll = 1;
  }

  updateChart(): void {
    if (!this.chart.length) return;
    this.chart.first
      .updateOptions({
        series: [
          {
            name: this.selectedRoot?.getNames(),
            data: this.selectedRootChartData.map((item) => item.kpiVal),
          },
        ],
        xaxis: {
          categories: this.selectedRootChartData.map((item) => item.issueYear),
        },
      })
      .then();
  }

  updateChartType(type: ChartType) {
    this.chart.first.updateOptions({ chart: { type: type } }).then();
    this.selectedChartType = type;
  }

  isSelectedChartType(type: ChartType) {
    return this.selectedChartType === type;
  }

  private loadTransactions() {
    this.dashboardService
      .loadSellKpiTransactions(this.criteria.criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        console.log(list);
        this.transactions.next(list);
      });
  }

  loadTransactionsBasedOnPurpose(): void {
    this.dashboardService.loadSellTransactionsBasedOnPurpose(this.criteria.criteria).subscribe((values) => {
      this.transactionsPurpose = values;
    });
  }

  openChart(item: SellTransactionPurpose): void {
    item.openChart(this.criteria.criteria).subscribe();
  }

  selectTop10Chart(item: Lookup): void {
    this.accordingToList.forEach((i) => {
      i === item ? (i.selected = true) : (i.selected = false);
    });
    this.selectedTop10 = item;
    this.dashboardService.loadSellTop10BasedOnCriteria(item, this.criteria.criteria).subscribe((top10ChartData) => {
      this.top10ChartData = top10ChartData;
      this.updateTop10Chart();
    });
  }

  updateTop10Chart(): void {
    if (!this.top10Chart.length) return;
    this.top10Chart.first
      .updateOptions({
        series: [
          {
            name: this.selectedTop10.getNames(),
            data: this.top10ChartData.map((item) => {
              return { x: item.zoneInfo.getNames(), y: item.kpiVal };
            }),
          },
        ],
        xaxis: {
          categories: [],
        },
      })
      .then();
  }
}
