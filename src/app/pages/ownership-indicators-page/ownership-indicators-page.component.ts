import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { AreasChartComponent } from '@components/areas-chart/areas-chart.component';
import { ButtonComponent } from '@components/button/button.component';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { MunicipalitiesChartComponent } from '@components/municipalities-chart/municipalities-chart.component';
import { NationalitiesChartComponent } from '@components/nationalities-chart/nationalities-chart.component';
import { PieChartComponent } from '@components/pie-chart/pie-chart.component';
import { PropertyCarouselComponent } from '@components/property-carousel/property-carousel.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { QatarInteractiveMapComponent } from '@components/qatar-interactive-map/qatar-interactive-map.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { CriteriaType } from '@enums/criteria-type';
import { AppTableDataSource } from '@models/app-table-data-source';
import { KpiBase } from '@models/kpi-base';
import { KpiPropertyType } from '@models/kpi-property-type';
import { KpiPurpose } from '@models/kpi-purpose';
import { KpiRoot } from '@models/kpi-root';
import { Lookup } from '@models/lookup';
import { OwnershipTransaction } from '@models/ownership-transaction';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { SectionTitleService } from '@services/section-title.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { NgxMaskPipe } from 'ngx-mask';
import { BehaviorSubject, Subject, combineLatest, switchMap, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-owner-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    TransactionsFilterComponent,
    KpiRootComponent,
    PurposeComponent,
    PropertyCarouselComponent,
    ButtonComponent,
    IconButtonComponent,
    FormatNumbersPipe,
    YoyIndicatorComponent,
    NgxMaskPipe,
    MatNativeDateModule,
    QatarInteractiveMapComponent,
    DurationChartComponent,
    PieChartComponent,
    MunicipalitiesChartComponent,
    AreasChartComponent,
    NationalitiesChartComponent,
    TableComponent,
    TableColumnTemplateDirective,
    TableColumnHeaderTemplateDirective,
    TableColumnCellTemplateDirective,
  ],
  templateUrl: './ownership-indicators-page.component.html',
  styleUrls: ['./ownership-indicators-page.component.scss'],
})
export default class OwnershipIndicatorsPageComponent implements OnInit, AfterViewInit, OnDestroy {
  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  sectionTitle = inject(SectionTitleService);

  destroy$ = new Subject<void>();

  municipalities = this.lookupService.ownerLookups.municipalityList;
  propertyTypes = this.lookupService.ownerLookups.propertyTypeList;
  propertyUsages = this.lookupService.ownerLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.ownerLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  nationalities = this.lookupService.ownerLookups.nationalityList;
  ownerTypes = this.lookupService.ownerLookups.ownerCategoryList;

  purposeKPIS = this.lookupService.ownerLookups.rentPurposeList.map((item) =>
    new KpiPurpose().clone<KpiPurpose>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );
  propertiesKPIS = this.lookupService.ownerLookups.propertyTypeList.map((item) =>
    new KpiPropertyType().clone<KpiPropertyType>({ id: item.lookupKey, arName: item.arName, enName: item.enName })
  );

  criteria = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  nationalityCriteria!: CriteriaContract;

  ownerMunicipalityCriteria: CriteriaContract & { nationalityCategoryId: number | null } = {
    ...this.criteria.criteria,
    nationalityCategoryId: null,
  };

  ownerAreaCriteria: CriteriaContract & { nationalityCategoryId: number | null } = {
    ...this.criteria.criteria,
    nationalityCategoryId: null,
  };

  ownershipMunicipalityCriteria: CriteriaContract & { nationalityCode: number } = {
    ...this.criteria.criteria,
    nationalityCode: -1,
  };

  ownershipAreaCriteria: CriteriaContract & { nationalityCode: number } = {
    ...this.criteria.criteria,
    nationalityCode: -1,
  };

  ownerRootKpis = [
    new KpiRoot().clone<KpiRoot & { nationalityCategoryId: number | null }>({
      id: 1,
      arName: this.lang.getArabicTranslation('total_number_of_properties_units'),
      enName: this.lang.getEnglishTranslation('total_number_of_properties_units'),
      url: this.urlService.URLS.OWNER_KPI1,
      purposeUrl: this.urlService.URLS.OWNER_KPI2,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI3,
      iconUrl: 'assets/icons/kpi/svg/owner/1.svg',
      nationalityCategoryId: null,
    }),
    new KpiRoot().clone<KpiRoot & { nationalityCategoryId: number | null }>({
      id: 4,
      arName: this.lang.getArabicTranslation('total_number_of_qatari_owners'),
      enName: this.lang.getEnglishTranslation('total_number_of_qatari_owners'),
      url: this.urlService.URLS.OWNER_KPI4,
      purposeUrl: this.urlService.URLS.OWNER_KPI5,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI6,
      iconUrl: 'assets/icons/kpi/svg/owner/2.svg',
      nationalityCategoryId: 1,
    }),
    new KpiRoot().clone<KpiRoot & { nationalityCategoryId: number | null }>({
      id: 7,
      arName: this.lang.getArabicTranslation('total_number_of_gulf_cooperation_council_countries_owners'),
      enName: this.lang.getEnglishTranslation('total_number_of_gulf_cooperation_council_countries_owners'),
      url: this.urlService.URLS.OWNER_KPI7,
      purposeUrl: this.urlService.URLS.OWNER_KPI8,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI9,
      iconUrl: 'assets/icons/kpi/svg/owner/3.svg',
      nationalityCategoryId: 2,
    }),
    new KpiRoot().clone<KpiRoot & { nationalityCategoryId: number | null }>({
      id: 71,
      arName: this.lang.getArabicTranslation('total_number_of_owners_from_other_nationalities'),
      enName: this.lang.getEnglishTranslation('total_number_of_owners_from_other_nationalities'),
      url: this.urlService.URLS.OWNER_KPI7_1,
      purposeUrl: this.urlService.URLS.OWNER_KPI8_1,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI9_1,
      iconUrl: 'assets/icons/kpi/svg/owner/3.svg',
      nationalityCategoryId: 3,
    }),
  ] as (KpiRoot & { nationalityCategoryId: number | null })[];

  selectedOwnerRoot = this.ownerRootKpis[0];
  selectedOwnerPurpose = this.purposeKPIS[0];

  ownershipRootKPIS = [
    new KpiRoot().clone<KpiRoot>({
      id: 10,
      arName: this.lang.getArabicTranslation('total_number_of_ownerships'),
      enName: this.lang.getEnglishTranslation('total_number_of_ownerships'),
      url: this.urlService.URLS.OWNER_KPI10,
      chartDataUrl: this.urlService.URLS.OWNER_KPI10_1,
      iconUrl: 'assets/icons/kpi/svg/owner/4.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 4,
      arName: this.lang.getArabicTranslation('total_number_of_qatari_ownerships'),
      enName: this.lang.getEnglishTranslation('total_number_of_qatari_ownerships'),
      url: this.urlService.URLS.OWNER_KPI11,
      chartDataUrl: this.urlService.URLS.OWNER_KPI11_1,
      iconUrl: 'assets/icons/kpi/svg/owner/2.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 7,
      arName: this.lang.getArabicTranslation('total_number_of_gulf_cooperation_council_countries_ownerships'),
      enName: this.lang.getEnglishTranslation('total_number_of_gulf_cooperation_council_countries_ownerships'),
      url: this.urlService.URLS.OWNER_KPI12,
      chartDataUrl: this.urlService.URLS.OWNER_KPI12_1,
      iconUrl: 'assets/icons/kpi/svg/owner/3.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 1,
      arName: this.lang.getArabicTranslation('total_number_of_ownerships_from_other_nationalities'),
      enName: this.lang.getEnglishTranslation('total_number_of_ownerships_from_other_nationalities'),
      url: this.urlService.URLS.OWNER_KPI13,
      chartDataUrl: this.urlService.URLS.OWNER_KPI13_1,
      iconUrl: 'assets/icons/kpi/svg/owner/1.svg',
    }),
  ];

  selectedOwnershipRoot = this.ownershipRootKPIS[1];

  selectedTab: 'ownership_indicators' | 'owner_indicators' = 'owner_indicators';

  ownerMunicipalitySeriesNames: Record<number, string> = {
    0: this.lang.map.owners_count,
  };

  municipalityLabel = (item: { municipalityId: number }) =>
    this.lookupService.ownerMunicipalitiesMap[item.municipalityId]?.getNames() ?? '';

  selectedOwnerMunicipalityId = 4;

  ownerAreaSeriesNames: Record<number, string> = {
    0: this.lang.map.owners_count,
  };

  areaLabel = (item: { areaCode: number }) => this.lookupService.ownerDistrictMap[item.areaCode]?.getNames() ?? '';

  nationalityLabel = (item: { nationalityId: number }) =>
    this.lookupService.ownerNationalityMap[item.nationalityId]?.getNames() ?? '';

  selectedNationalityId = 634;
  specialNationality = new Lookup().clone<Lookup>({ lookupKey: 82804, arName: 'أملاك دولة', enName: 'State property' });

  ownershipMunicipalityRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI14,
    hasPrice: false,
  };

  ownershipMunicipalitySeriesNames: Record<number, string> = {
    0: this.lang.map.ownerships_count,
  };

  selectedOwnershipMunicipalityId = 4;

  ownershipAreaRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI15,
    hasPrice: false,
  };

  ownershipAreaSeriesNames: Record<number, string> = {
    0: this.lang.map.ownerships_count,
  };

  durationRootData = {
    chartDataUrl: this.urlService.URLS[this._getChartDataUrl('OWNER_KPI16')],
    hasPrice: false,
  };

  ownerTypeRootData = {
    chartDataUrl: this.urlService.URLS[this._getChartDataUrl('OWNER_KPI19')],
    hasPrice: false,
  };

  ownerTypeLabel = (item: { ageCategory: number }) =>
    this.lookupService.ownerOwnerCategoryMap[item.ageCategory].getNames();

  ageCategoryRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI17,
    hasPrice: false,
  };

  ageCategoryLabel = (item: { ageCategory: number }) =>
    this.lookupService.ownerAgeCategoryMap[item.ageCategory].getNames();

  genderRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI18,
    hasPrice: false,
  };

  genderLabel = (item: { gender: number }) => this.lookupService.ownerGenderMap[item.gender]?.getNames() ?? '-';

  transactionsSubject = new BehaviorSubject<OwnershipTransaction[]>([]);
  transactions$ = this.transactionsSubject.asObservable();
  dataSource: AppTableDataSource<OwnershipTransaction> = new AppTableDataSource(this.transactions$);
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.nationalityCriteria = { ...this.criteria.criteria, nationalityCode: this.selectedNationalityId };
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  switchTab(tab: 'ownership_indicators' | 'owner_indicators'): void {
    this.selectedTab = tab;
    this.loadRootKpisData();
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };

    this.loadRootKpisData();
  }

  loadRootKpisData() {
    (this.selectedTab === 'owner_indicators' ? this.ownerRootKpis : this.ownershipRootKPIS).map((item) => {
      this.dashboardService
        .loadKpiRoot(item, this.criteria.criteria)
        .pipe(take(1))
        .subscribe((value) => {
          item.kpiData = value[0];
        });
    });

    this.selectedTab === 'owner_indicators'
      ? this.ownerRootItemSelected(this.selectedOwnerRoot)
      : this.ownershipRootItemSelected(this.selectedOwnershipRoot);
  }

  ownerRootItemSelected(item: KpiRoot) {
    this.selectedOwnerRoot = item as KpiRoot & { nationalityCategoryId: number | null };
    this.ownerRootKpis.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.ownerMunicipalityCriteria = {
      ...this.criteria.criteria,
      municipalityId: -1,
      nationalityCategoryId: this.selectedOwnerRoot.nationalityCategoryId,
    };

    this.dashboardService
      .loadPurposeKpi(item, this.criteria.criteria)
      .pipe(take(1))
      .subscribe((data) => {
        const _purposeKpiData = data.reduce((acc, item) => {
          return { ...acc, [item.purposeId]: item };
        }, {} as Record<number, KpiBaseModel>);

        this.purposeKPIS.forEach((item) => item.kpiData.resetAllValues());
        this.selectedOwnershipRoot && this.updateAllPurpose();
        this.purposeKPIS.forEach((item) => {
          Object.prototype.hasOwnProperty.call(_purposeKpiData, item.id) && (item.kpiData = _purposeKpiData[item.id]);
        });
        this.selectedOwnerPurpose && this.purposeSelected(this.selectedOwnerPurpose);
      });
  }

  ownershipRootItemSelected(item?: KpiRoot) {
    if (!item) return;
    this.selectedOwnershipRoot = item as KpiRoot & { nationalityChartUrl: string };
    this.ownershipRootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });
  }

  updateAllPurpose(): void {
    const _purpose = this.purposeKPIS.find((i) => i.id === -1);
    _purpose &&
      (_purpose.kpiData = KpiBase.kpiFactory(this.selectedOwnerRoot.hasSqUnit).clone(this.selectedOwnerRoot.kpiData));
  }

  purposeSelected(item: KpiPurpose) {
    this.purposeKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.selectedOwnerPurpose = item;

    this.selectedOwnerRoot &&
      this.dashboardService
        .loadPropertyTypeKpi(this.selectedOwnerRoot, {
          ...this.criteria.criteria,
          purposeList: [item.id],
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          this.propertiesKPIS.forEach((item) => item.kpiData.resetAllValues());

          this.propertiesKPIS = this.propertiesKPIS
            .map((item) => {
              const _propertyTypeKpiData = result.find((i) => i.propertyTypeId === item.id);
              _propertyTypeKpiData && (item.kpiData = _propertyTypeKpiData);
              return item;
            })
            .sort((a, b) => a.kpiData.getKpiVal() - b.kpiData.getKpiVal());
          this.updateAllPropertyType();
        });
  }

  updateAllPropertyType(): void {
    const _propertyType = this.propertiesKPIS.find((i) => i.id === -1);
    _propertyType &&
      (_propertyType.kpiData = KpiBase.kpiFactory(this.selectedOwnerRoot.hasSqUnit).clone(
        this.selectedOwnerPurpose.kpiData
      ));
  }

  updateOwnerAreasChartCriteria(municipalityId: number) {
    this.selectedOwnerMunicipalityId = municipalityId;

    this.ownerAreaCriteria = {
      ...this.criteria.criteria,
      nationalityCategoryId: this.selectedOwnerRoot.nationalityCategoryId,
      municipalityId,
    };
  }

  onSelectedNationalityChanged(nationalityId: number) {
    this.selectedNationalityId = nationalityId;
    this.durationRootData.chartDataUrl = this.urlService.URLS[this._getChartDataUrl('OWNER_KPI16')];
    this.nationalityCriteria = { ...this.criteria.criteria, nationalityCode: nationalityId };

    this.ownershipMunicipalityRootData.chartDataUrl = this.urlService.URLS[this._getChartDataUrl('OWNER_KPI14')];
    this.ownershipMunicipalityCriteria = {
      ...this.nationalityCriteria,
      municipalityId: -1,
    };

    this.reloadSubject.next();
  }

  updateOwnershipAreasChartCriteria(municipalityId: number) {
    this.ownershipAreaRootData.chartDataUrl = this.urlService.URLS[this._getChartDataUrl('OWNER_KPI15')];

    this.ownershipAreaCriteria = {
      ...this.criteria.criteria,
      nationalityCode: this.selectedNationalityId,
      municipalityId,
    };

    this.selectedOwnershipMunicipalityId = municipalityId;
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
            ...this.nationalityCriteria,
            limit: paginationOptions.limit,
            offset: paginationOptions.offset,
          } as CriteriaContract;
          return this.dashboardService.loadOwnershipsTransactions(_criteria);
        })
      )
      .subscribe(({ count, transactionList }) => {
        this.transactionsSubject.next(transactionList);
        this.transactionsCount = count;
      });
  }

  private _getChartDataUrl(baseUrl: keyof typeof this.urlService.URLS): keyof typeof this.urlService.URLS {
    if (this.selectedNationalityId === this.specialNationality.lookupKey)
      return (baseUrl + '_1') as keyof typeof this.urlService.URLS;

    return baseUrl;
  }

  getNationalityNames(nationalityId: number) {
    return nationalityId === this.specialNationality.lookupKey
      ? this.specialNationality.getNames()
      : this.lookupService.ownerNationalityMap[nationalityId]?.getNames() || '';
  }
  getStringSelectedCriteria(): string {
    return this.sectionTitle.getSelectedCriteria('owner', this.criteria.criteria, false, true, false);
  }
}
