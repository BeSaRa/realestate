import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { TranslationService } from '@services/translation.service';
import { RentalTransactionsMeasuringComponent } from '@components/rental-transactions-measuring/rental-transactions-measuring.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { RentalContractsComponent } from '@components/rental-contracts/rental-contracts.component';
import { RentalTransactionsListComponent } from '@components/rental-transactions-list/rental-transactions-list.component';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { CriteriaType } from '@enums/criteria-type';
import { DashboardService } from '@services/dashboard.service';
import { KpiRoot } from '@models/kpiRoot';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { UrlService } from '@services/url.service';
import { LookupService } from '@services/lookup.service';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel2';
import { PropertyBlockComponent } from '@components/property-block/property-block.component';
import { BidiModule } from '@angular/cdk/bidi';
import { RentDefaultValues } from '@models/rent-default-values';
import { combineLatest, ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { KpiModel } from '@models/kpi-model';
import { Lookup } from '@models/lookup';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { formatNumber } from '@utils/utils';
import { TableComponent } from '@components/table/table.component';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { RentTransaction } from '@models/rent-transaction';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';

@Component({
  selector: 'app-rental-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    RentalTransactionsMeasuringComponent,
    RentalContractsComponent,
    RentalTransactionsListComponent,
    KpiRootComponent,
    PurposeComponent,
    IvyCarouselModule,
    PropertyBlockComponent,
    BidiModule,
    NgApexchartsModule,
    TableComponent,
    TableColumnTemplateDirective,
    IconButtonComponent,
  ],
  templateUrl: './rental-indicators-page.component.html',
  styleUrls: ['./rental-indicators-page.component.scss'],
})
export default class RentalIndicatorsPageComponent {
  transactions = new ReplaySubject<RentTransaction[]>(1);
  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  destroy$ = new Subject<void>();

  criteria!: {
    criteria: RentCriteriaContract;
    type: CriteriaType;
  };
  @ViewChild('chart')
  chart!: ChartComponent;

  displayedColumns = [
    { columnName: 'municipality_id', columnHeader: this.lang.map.municipal },
    { columnName: 'unit_details', columnHeader: this.lang.map.unit_details },
    { columnName: 'rental_value', columnHeader: this.lang.map.rental_value },
    { columnName: 'contract_start_date', columnHeader: this.lang.map.contract_start_date },
    { columnName: 'contract_end_date', columnHeader: this.lang.map.contract_end_date },
  ];

  @ViewChild('carousel')
  carousel!: CarouselComponent;

  rootKPIS = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('the_total_number_of_lease_contracts'),
      this.lang.getEnglishTranslation('the_total_number_of_lease_contracts'),
      false,
      this.urlService.URLS.RENT_KPI1,
      this.urlService.URLS.RENT_KPI2,
      this.urlService.URLS.RENT_KPI3,
      this.urlService.URLS.RENT_KPI19
    ),
    new KpiRoot(
      4,
      this.lang.getArabicTranslation('the_total_number_of_properties_units_rented'),
      this.lang.getEnglishTranslation('the_total_number_of_properties_units_rented'),
      false,
      this.urlService.URLS.RENT_KPI4,
      this.urlService.URLS.RENT_KPI5,
      this.urlService.URLS.RENT_KPI6,
      this.urlService.URLS.RENT_KPI20
    ),

    new KpiRoot(
      10,
      this.lang.getArabicTranslation('total_rented_space'),
      this.lang.getEnglishTranslation('total_rented_space'),
      false,
      this.urlService.URLS.RENT_KPI10,
      this.urlService.URLS.RENT_KPI11,
      this.urlService.URLS.RENT_KPI12,
      this.urlService.URLS.RENT_KPI21
    ),
    new KpiRoot(
      7,
      this.lang.getArabicTranslation('the_total_value_of_lease_contracts'),
      this.lang.getEnglishTranslation('the_total_value_of_lease_contracts'),
      true,
      this.urlService.URLS.RENT_KPI7,
      this.urlService.URLS.RENT_KPI8,
      this.urlService.URLS.RENT_KPI9,
      this.urlService.URLS.RENT_KPI22
    ),
    new KpiRoot(
      16,
      this.lang.getArabicTranslation('the_average_price_per_square_meter_square_foot'),
      this.lang.getEnglishTranslation('the_average_price_per_square_meter_square_foot'),
      true,
      this.urlService.URLS.RENT_KPI16,
      this.urlService.URLS.RENT_KPI17,
      this.urlService.URLS.RENT_KPI18,
      this.urlService.URLS.RENT_KPI24
    ),
    new KpiRoot(
      13,
      this.lang.getArabicTranslation('average_rental_price_per_unit_property'),
      this.lang.getEnglishTranslation('average_rental_price_per_unit_property'),
      true,
      this.urlService.URLS.RENT_KPI13,
      this.urlService.URLS.RENT_KPI14,
      this.urlService.URLS.RENT_KPI15,
      this.urlService.URLS.RENT_KPI23
    ),
  ];

  selectedChartType = 'line';

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
    },
    stroke: {
      curve: 'smooth',
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
    tooltip: {},
  };

  purposeKPIS = this.lookupService.lookups.rentPurposeList;

  propertiesKPIS = this.lookupService.lookups.propertyTypeList;

  selectedRoot?: KpiRoot;

  selectedRootChartData!: KpiModel[];

  selectedPurpose?: Lookup = this.lookupService.lookups.rentPurposeList[0];

  get priceList() {
    return this.rootKPIS.filter((item) => item.hasPrice);
  }

  get nonePriceList() {
    return this.rootKPIS.filter((item) => !item.hasPrice);
  }

  updateAllPurpose(value: number, yoy: number): void {
    const lookup = this.purposeKPIS.find((i) => i.lookupKey === -1);
    lookup && (lookup.value = value) && (lookup.yoy = yoy);
  }

  filterChange({ criteria, type }: { criteria: RentCriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };
    if (type === CriteriaType.DEFAULT) {
      // load default
      this.dashboardService.loadRentDefaults(criteria).subscribe((result) => {
        this.setDefaultRoots(result[0]);
        this.rootItemSelected(this.rootKPIS[0]);
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

      this.rootItemSelected(this.rootKPIS[0]);
    }
    this.loadTransactions();
  }

  rootItemSelected(item: KpiRoot) {
    this.selectedRoot = item;
    this.rootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    combineLatest([
      this.dashboardService.loadPurposeKpi(item, this.criteria.criteria),
      this.dashboardService.loadLineChartKpi(item, this.criteria.criteria),
    ]).subscribe(([subKPI, lineChartData]) => {
      this.selectedRootChartData = lineChartData;
      const purpose = subKPI.reduce((acc, item) => {
        return { ...acc, [item.rentPurposeId]: item };
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
    });
    this.purposeSelected(this.purposeKPIS[this.purposeKPIS.length - 1]);
  }

  private setDefaultRoots(rentDefaultValue?: RentDefaultValues) {
    if (!rentDefaultValue) {
      this.rootKPIS.forEach((item) => {
        item.setValue(0);
        item.setYoy(0);
      });
    } else {
      this.rootKPIS.forEach((item) => {
        const value = `kpi${item.id}Val`;
        const yoy = `kpiYoY${item.id}`;
        item.setValue(rentDefaultValue[value as keyof RentDefaultValues]);
        item.setYear(rentDefaultValue.issueYear);
        item.setYoy(rentDefaultValue[yoy as keyof RentDefaultValues]);
      });
    }
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

  updateChart(): void {
    this.chart
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

  private loadTransactions() {
    this.dashboardService
      .loadKpiTransactions(this.criteria.criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.transactions.next(list);
      });
  }

  private goToFirstCell(): void {
    this.carousel.cellsToScroll = this.carousel.cellLength;
    this.carousel.next();
    this.carousel.cellsToScroll = 1;
  }

  updateChartType(type: string) {
    this.chart.updateOptions({ chart: { type: type } }).then();
    this.selectedChartType = type;
  }

  isSelectedChartType(type: string) {
    return this.selectedChartType === type;
  }
}
