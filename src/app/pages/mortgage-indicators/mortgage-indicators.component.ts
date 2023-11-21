import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { StackedDurationChartComponent } from '@components/stacked-duration-chart/stacked-duration-chart.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { CriteriaType } from '@enums/criteria-type';
import { TransactionType } from '@enums/transaction-type';
import { AppTableDataSource } from '@models/app-table-data-source';
import { KpiRoot } from '@models/kpi-root';
import { MortgageTransaction } from '@models/mortgage-transaction';
import { TableSortOption } from '@models/table-sort-option';
import { DashboardService } from '@services/dashboard.service';
import { DataInfoService } from '@services/data-info.service';
import { LookupService } from '@services/lookup.service';
import { SectionTitleService } from '@services/section-title.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { UrlService } from '@services/url.service';
import { BehaviorSubject, combineLatest, delay, map, Observable, of, ReplaySubject, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-mortgage-indicators',
  standalone: true,
  imports: [
    CommonModule,
    BidiModule,
    ExtraHeaderComponent,
    MatAutocompleteModule,
    MatOptionModule,
    ReactiveFormsModule,
    TransactionsFilterComponent,
    KpiRootComponent,
    TableComponent,
    TableColumnTemplateDirective,
    TableColumnHeaderTemplateDirective,
    TableColumnCellTemplateDirective,
    MatTableModule,
    DurationChartComponent,
    StackedDurationChartComponent,
  ],
  templateUrl: './mortgage-indicators.component.html',
  styleUrls: ['./mortgage-indicators.component.scss'],
})
export default class MortgageIndicatorsComponent implements OnInit {
  lang = inject(TranslationService);
  lookupService = inject(LookupService);
  urlService = inject(UrlService);
  dashboardService = inject(DashboardService);
  unitsService = inject(UnitsService);
  sectionTitle = inject(SectionTitleService);
  dataInfoService = inject(DataInfoService);

  reload$ = new ReplaySubject<void>(1);
  private paginate$ = new BehaviorSubject({
    offset: 0,
    limit: 5,
  });

  municipalities = this.lookupService.mortLookups.municipalityList;
  areas = this.lookupService.mortLookups.districtList;
  propertyUsage = this.lookupService.mortLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  propertyTypes = this.lookupService.mortLookups.propertyTypeList;
  paramsRange = this.lookupService.mortLookups.maxParams;

  criteria = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  isMonthlyDuration = true;
  isMonthlyDurationForStacked = true;
  isMonthlyDurationForUnits = true;

  rootKpis = [
    new KpiRoot().clone<KpiRoot>({
      id: 1,
      arName: this.lang.getArabicTranslation('total_mortgage_transactions'),
      enName: this.lang.getEnglishTranslation('total_mortgage_transactions'),
      url: this.urlService.URLS.MORT_KPI1,
      iconUrl: 'assets/icons/kpi/svg/mort/1.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 3,
      arName: this.lang.getArabicTranslation('the_total_number_of_mortgaged_units'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_mortgaged_units'),
      url: this.urlService.URLS.MORT_KPI3,
      iconUrl: 'assets/icons/kpi/svg/mort/2.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 5,
      arName: this.lang.getArabicTranslation('total_value_of_mortgage_transactions'),
      enName: this.lang.getEnglishTranslation('total_value_of_mortgage_transactions'),
      url: this.urlService.URLS.MORT_KPI5,
      iconUrl: 'assets/icons/kpi/svg/mort/3.svg',
      hasPrice: true,
    }),
  ];

  countRootData = {
    chartDataUrl: this.urlService.URLS.MORT_KPI2,
    hasPrice: false,
  };

  countSeriesNames: Record<number, string> = {
    [TransactionType.MORTGAGE]: this.lang.map.mortgage,
    [TransactionType.SELL]: this.lang.map.sell,
  };

  unitsRootData = {
    chartDataUrl: this.urlService.URLS.MORT_KPI4,
    hasPrice: false,
  };

  valueRootData = {
    chartDataUrl: this.urlService.URLS.MORT_KPI6,
    hasPrice: true,
  };

  transactions$: Observable<MortgageTransaction[]> = this.loadTransactions();
  dataSource: AppTableDataSource<MortgageTransaction> = new AppTableDataSource(this.transactions$);
  transactionsCount = 0;
  transactionsSortOptions: TableSortOption[] = [
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('most_recent'),
      enName: this.lang.getEnglishTranslation('most_recent'),
      value: {
        column: 'issueDate',
        direction: 'desc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('oldest'),
      enName: this.lang.getEnglishTranslation('oldest'),
      value: {
        column: 'issueDate',
        direction: 'asc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('the_higher_price'),
      enName: this.lang.getEnglishTranslation('the_higher_price'),
      value: {
        column: 'realEstateValue',
        direction: 'desc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('the_lowest_price'),
      enName: this.lang.getEnglishTranslation('the_lowest_price'),
      value: {
        column: 'realEstateValue',
        direction: 'asc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('highest_price_per_square_foot'),
      enName: this.lang.getEnglishTranslation('highest_price_per_square_foot'),
      value: {
        column: 'priceMT',
        direction: 'desc',
      },
    }),
    new TableSortOption().clone<TableSortOption>({
      arName: this.lang.getArabicTranslation('lowest_price_per_square_foot'),
      enName: this.lang.getEnglishTranslation('lowest_price_per_square_foot'),
      value: {
        column: 'priceMT',
        direction: 'asc',
      },
    }),
  ];

  ngOnInit() {
    this.dataInfoService.setEnabled(true);
    this.dataInfoService.setText(
      'data_sources_for_mortgage_indicators_include_data_from_the_ministry_of_justice_real_estate_registry_database'
    );
    this.reload$.next();
  }

  filterChange($event: { criteria: CriteriaContract; type: CriteriaType }): void {
    this.criteria = $event;
    this.dashboardService
      .loadMortgageRoots(this.criteria.criteria)
      .pipe(take(1))
      .subscribe((values) => {
        this.rootKpis.map((item, index) => {
          item.kpiData = values[index];
        });
        this.reload$.next();
      });
  }

  paginate($event: PageEvent) {
    this.paginate$.next({
      offset: $event.pageSize * $event.pageIndex,
      limit: $event.pageSize,
    });
  }

  protected loadTransactions(): Observable<MortgageTransaction[]> {
    return of(undefined)
      .pipe(delay(0))
      .pipe(
        switchMap(() => {
          return combineLatest([this.reload$, this.paginate$]).pipe(
            switchMap(([, paginationOptions]) => {
              this.criteria.criteria.limit = paginationOptions.limit;
              this.criteria.criteria.offset = paginationOptions.offset;
              return this.dashboardService.loadMortgageKpiTransactions(this.criteria.criteria);
            }),
            map(({ count, transactionList }) => {
              this.transactionsCount = count;
              return transactionList;
            })
          );
        })
      );
  }

  isMonthlyDurationType(value: boolean) {
    this.isMonthlyDuration = value;
  }

  isMonthlyDurationTypeForStacked(value: boolean) {
    this.isMonthlyDurationForStacked = value;
  }
  isMonthlyDurationTypeForUnits(value: boolean) {
    this.isMonthlyDurationForUnits = value;
  }

  getStringSelectedCriteria(showYearInTitle = true): string {
    return this.sectionTitle.getSelectedCriteria('mort', this.criteria.criteria, false, true, showYearInTitle);
  }
}
