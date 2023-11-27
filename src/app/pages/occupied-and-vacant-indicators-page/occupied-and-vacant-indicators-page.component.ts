import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AreasChartComponent } from '@components/areas-chart/areas-chart.component';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { MunicipalitiesChartComponent } from '@components/municipalities-chart/municipalities-chart.component';
import { PremiseTypesPopupComponent } from '@components/premise-types-popup/premise-types-popup.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { StackedDurationChartComponent } from '@components/stacked-duration-chart/stacked-duration-chart.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { CriteriaType } from '@enums/criteria-type';
import { OccupationStatus } from '@enums/occupation-status';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { AppTableDataSource } from '@models/app-table-data-source';
import { KpiBase } from '@models/kpi-base';
import { KpiPurpose } from '@models/kpi-purpose';
import { KpiRoot } from '@models/kpi-root';
import { OccupancyTransaction } from '@models/occupancy-transaction';
import { DashboardService } from '@services/dashboard.service';
import { DialogService } from '@services/dialog.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BehaviorSubject, Subject, combineLatest, switchMap, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-occupied-and-vacant-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    KpiRootComponent,
    PurposeComponent,
    ButtonComponent,
    StackedDurationChartComponent,
    MunicipalitiesChartComponent,
    AreasChartComponent,
    NgApexchartsModule,
    TableComponent,
    TableColumnTemplateDirective,
    TableColumnHeaderTemplateDirective,
    TableColumnCellTemplateDirective,
  ],
  templateUrl: './occupied-and-vacant-indicators-page.component.html',
  styleUrls: ['./occupied-and-vacant-indicators-page.component.scss'],
})
export default class OccupiedAndVacantIndicatorsPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  dialog = inject(DialogService);

  municipalities = this.lookupService.ovLookups.municipalityList;
  zones = this.lookupService.ovLookups.zoneList;
  areas = this.lookupService.ovLookups.districtList;
  occupancyStatuses = this.lookupService.ovLookups.occupancyStatusList;
  premiseCategories = this.lookupService.ovLookups.premiseCategoryList;
  premiseTypes = this.lookupService.ovLookups.premiseTypeList;

  criteria = {} as {
    criteria: CriteriaContract & { occupancyStatus: number | null };
    type: CriteriaType;
  };

  durationsCriteria = { ...this.criteria.criteria, occupancyStatus: null } as typeof this.criteria.criteria;

  areasCriteria = { ...this.criteria.criteria, occupancyStatus: null } as typeof this.criteria.criteria;

  rootKPIS = [
    new KpiRoot().clone<KpiRoot>({
      id: -1,
      arName: this.lang.getArabicTranslation('total_number_of_units'),
      enName: this.lang.getEnglishTranslation('total_number_of_units'),
      url: this.urlService.URLS.OV_KPI1,
      purposeUrl: this.urlService.URLS.OV_KPI2,
      propertyTypeUrl: this.urlService.URLS.OV_KPI3,
      iconUrl: 'assets/icons/kpi/svg/1.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 0,
      arName: this.lang.getArabicTranslation('total_number_of_vacant_units'),
      enName: this.lang.getEnglishTranslation('total_number_of_vacant_units'),
      url: this.urlService.URLS.OV_KPI1,
      purposeUrl: this.urlService.URLS.OV_KPI2,
      propertyTypeUrl: this.urlService.URLS.OV_KPI3,
      iconUrl: 'assets/icons/kpi/svg/3.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 1,
      arName: this.lang.getArabicTranslation('total_number_of_occupied_units'),
      enName: this.lang.getEnglishTranslation('total_number_of_occupied_units'),
      url: this.urlService.URLS.OV_KPI1,
      purposeUrl: this.urlService.URLS.OV_KPI2,
      propertyTypeUrl: this.urlService.URLS.OV_KPI3,
      iconUrl: 'assets/icons/kpi/svg/8.svg',
    }),
  ];

  selectedRoot = this.rootKPIS[0];

  categoryKPIs = this.lookupService.ovLookups.premiseCategoryList.map((item) =>
    new KpiPurpose().clone<KpiPurpose>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );
  selectedCategory = this.categoryKPIs[0];

  typeKPIs = this.lookupService.ovLookups.premiseTypeList.map((item) =>
    new KpiPurpose().clone<KpiPurpose>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );
  filteredTypeKPIs = this.typeKPIs;

  readonly shownTypeKpisCount = 14;

  totalCountChartData = {
    chartDataUrl: this.urlService.URLS.OV_KPI4,
    hasPrice: false,
  };

  totalCountSeriesNames: Record<number, string> = {
    [OccupationStatus.VACANT]: this.lang.map.vacant,
    [OccupationStatus.OCCUPIED]: this.lang.map.occupied,
  };

  municipalitySeriesNames: Record<number, string> = {
    [OccupationStatus.VACANT]: this.lang.map.vacant,
    [OccupationStatus.OCCUPIED]: this.lang.map.occupied,
  };

  municipalityLabel = (item: { kpiVal: number; municipalityId: number }) =>
    this.lookupService.ovMunicipalitiesMap[item.municipalityId].getNames();

  selectedMunicipalityId = 4;

  areaSeriesNames: Record<number, string> = {
    [OccupationStatus.VACANT]: this.lang.map.vacant,
    [OccupationStatus.OCCUPIED]: this.lang.map.occupied,
  };

  areaLabel = (item: { kpiVal: number; zoneNo: number }) => this.lookupService.ovZonesMap[item.zoneNo].getNames();

  transactionsSubject = new BehaviorSubject<OccupancyTransaction[]>([]);
  transactions$ = this.transactionsSubject.asObservable();
  dataSource: AppTableDataSource<OccupancyTransaction> = new AppTableDataSource(this.transactions$);
  transactionsCount = 0;

  paginateSubject = new BehaviorSubject({
    offset: 0,
    limit: 5,
  });
  paginate$ = this.paginateSubject.asObservable();

  reloadSubject = new Subject<void>();
  reload$ = this.reloadSubject.asObservable();

  ngOnInit(): void {
    this._listenToTransactionsReloadAndPaginate();
    setTimeout(() => {
      this.reloadSubject.next();
    }, 0);
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria: criteria as CriteriaContract & { occupancyStatus: number | null }, type };
    this.durationsCriteria = { ...this.criteria.criteria, occupancyStatus: null };
    if (type === CriteriaType.DEFAULT) return;

    this.rootKPIS.map((item) => {
      const _criteria = { ...this.criteria.criteria, occupancyStatus: item?.id === -1 ? null : item?.id ?? 0 };

      this.dashboardService
        .loadKpiRoot(item, _criteria)
        .pipe(take(1))
        .subscribe((value) => {
          item.kpiData = value[0];
        });
    });

    this.rootItemSelected(this.selectedRoot);
    this.reloadSubject.next();
  }

  rootItemSelected(item?: KpiRoot) {
    if (!item) return;
    this.selectedRoot = item;

    const _criteria = { ...this.criteria.criteria, occupancyStatus: item?.id === -1 ? null : item?.id ?? 0 };

    this.rootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.dashboardService
      .loadPurposeKpi(item, _criteria)
      .pipe(take(1))
      .subscribe((data) => {
        const _categoriesKpiData = data.reduce((acc, item) => {
          return { ...acc, [item['premiseCategoryId' as keyof KpiBaseModel] as number]: item };
        }, {} as Record<number, KpiBaseModel>);

        this.categoryKPIs.forEach((item) => item.kpiData.resetAllValues());
        this.selectedRoot && this.updateAllCategory();
        this.categoryKPIs.forEach((item) => {
          Object.prototype.hasOwnProperty.call(_categoriesKpiData, item.id) &&
            (item.kpiData = _categoriesKpiData[item.id]);
        });
        this.selectedCategory && this.categorySelected(this.selectedCategory);
        //   this.rootDataSubject.next(this.selectedRoot);
      });
  }

  updateAllCategory(): void {
    const _category = this.categoryKPIs.find((i) => i.id === -1);
    _category && (_category.kpiData = KpiBase.kpiFactory(this.selectedRoot.hasSqUnit).clone(this.selectedRoot.kpiData));
  }

  categorySelected(item: KpiPurpose) {
    this.categoryKPIs.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.selectedCategory = item;

    const _criteria = {
      ...this.criteria.criteria,
      occupancyStatus: this.selectedRoot.id === -1 ? null : this.selectedRoot.id,
      ['premiseCategoryList' as keyof CriteriaContract]: [item.id],
    };

    this.selectedRoot &&
      this.dashboardService
        .loadPropertyTypeKpi(this.selectedRoot, _criteria)
        .pipe(take(1))
        .subscribe((result) => {
          const _types = result.reduce((acc, cur) => {
            return { ...acc, [cur['premiseTypeId' as keyof KpiBaseModel] as number]: cur };
          }, {} as Record<number, KpiBaseModel>);
          this.typeKPIs.forEach((item) => item.kpiData.resetAllValues());

          this.filteredTypeKPIs = this.typeKPIs
            .map((item) => {
              _types[item.id] && (item.kpiData = _types[item.id]);
              return item;
            })
            .sort((a, b) => b.kpiData.getKpiVal() - a.kpiData.getKpiVal())
            .filter((item) => item.kpiData.getKpiVal() != 0);
          this.updateAllPremiseType();
        });
  }

  updateAllPremiseType(): void {
    const _premise = this.typeKPIs.find((i) => i.id === -1);
    _premise &&
      (_premise.kpiData = KpiBase.kpiFactory(this.selectedRoot.hasSqUnit).clone(this.selectedCategory.kpiData));
  }

  showAllPremiseTypes() {
    this.dialog.open(PremiseTypesPopupComponent, {
      data: {
        title: this.selectedRoot.getNames() + ' (' + this.lang.map.depending_on_type + ')',
        types: this.filteredTypeKPIs,
      },
      maxWidth: '95vw',
      minWidth: '95vw',
      maxHeight: '95vh',
    });
  }

  updateAreasChartCriteria(municipalityId: number) {
    this.selectedMunicipalityId = municipalityId;
    this.areasCriteria = { ...this.criteria.criteria, occupancyStatus: null, municipalityId };
  }

  paginate($event: PageEvent) {
    this.paginateSubject.next({
      offset: $event.pageSize * $event.pageIndex,
      limit: $event.pageSize,
    });
  }

  private _listenToTransactionsReloadAndPaginate() {
    combineLatest([this.reload$, this.paginate$])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([, paginationOptions]) => {
          const _criteria = {
            ...this.criteria.criteria,
            limit: paginationOptions.limit,
            offset: paginationOptions.offset,
          } as CriteriaContract;
          return this.dashboardService.loadOccupancyTransactions(_criteria);
        })
      )
      .subscribe(({ count, transactionList }) => {
        this.transactionsSubject.next(transactionList);
        this.transactionsCount = count;
      });
  }
}
