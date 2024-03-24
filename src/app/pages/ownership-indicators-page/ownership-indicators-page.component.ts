import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { AreasChartComponent } from '@components/areas-chart/areas-chart.component';
import { ButtonComponent } from '@components/button/button.component';
import { DurationChartComponent } from '@components/duration-chart/duration-chart.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { MunicipalitiesChartComponent } from '@components/municipalities-chart/municipalities-chart.component';
import { NationalitiesChartComponent } from '@components/nationalities-chart/nationalities-chart.component';
import { PieChartComponent } from '@components/pie-chart/pie-chart.component';
import { PropertyCarouselComponent } from '@components/property-carousel/property-carousel.component';
import { PurposeListComponent } from '@components/purpose-list/purpose-list.component';
import { QatarInteractiveMapComponent } from '@components/qatar-interactive-map/qatar-interactive-map.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { APP_PAGES_SECTIONS } from '@constants/injection-tokens';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { SectionGuardDirective } from '@directives/section-guard.directive';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { CriteriaType } from '@enums/criteria-type';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
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

@Component({
  selector: 'app-owner-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    TransactionsFilterComponent,
    KpiRootComponent,
    PropertyCarouselComponent,
    ButtonComponent,
    IconButtonComponent,
    FormatNumbersPipe,
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
    SectionGuardDirective,
    PurposeListComponent,
  ],
  templateUrl: './ownership-indicators-page.component.html',
  styleUrls: ['./ownership-indicators-page.component.scss'],
})
export default class OwnershipIndicatorsPageComponent extends OnDestroyMixin(class {}) implements AfterViewInit {
  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  sectionTitle = inject(SectionTitleService);
  pageSections = inject(APP_PAGES_SECTIONS).OWNER_PAGE;

  municipalities = this.lookupService.ownerLookups.municipalityList;
  propertyTypes = this.lookupService.ownerLookups.propertyTypeList;
  propertyUsages = this.lookupService.ownerLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.ownerLookups.districtList;
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

  ownerNationalityCategoryCriteria: CriteriaContract & { nationalityCategoryId: number | null } = {
    ...this.criteria.criteria,
    nationalityCategoryId: null,
  };

  ownerRootKpis = [
    // new KpiRoot().clone<KpiRoot & { nationalityCategoryId: number | null }>({
    //   id: 1,
    //   arName: this.lang.getArabicTranslation('total_number_of_properties_units'),
    //   enName: this.lang.getEnglishTranslation('total_number_of_properties_units'),
    //   url: this.urlService.URLS.OWNER_KPI1,
    //   purposeUrl: this.urlService.URLS.OWNER_KPI2,
    //   propertyTypeUrl: this.urlService.URLS.OWNER_KPI3,
    //   iconUrl: 'assets/icons/kpi/svg/owner/1.svg',
    //   nationalityCategoryId: null,
    // }),
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
      id: 71,
      arName: this.lang.getArabicTranslation('total_number_of_gulf_cooperation_council_countries_owners'),
      enName: this.lang.getEnglishTranslation('total_number_of_gulf_cooperation_council_countries_owners'),
      url: this.urlService.URLS.OWNER_KPI7_1,
      purposeUrl: this.urlService.URLS.OWNER_KPI8_1,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI9_1,
      iconUrl: 'assets/icons/kpi/svg/owner/3.svg',
      nationalityCategoryId: 2,
    }),
    new KpiRoot().clone<KpiRoot & { nationalityCategoryId: number | null }>({
      id: 7,
      arName: this.lang.getArabicTranslation('total_number_of_owners_from_other_nationalities'),
      enName: this.lang.getEnglishTranslation('total_number_of_owners_from_other_nationalities'),
      url: this.urlService.URLS.OWNER_KPI7,
      purposeUrl: this.urlService.URLS.OWNER_KPI8,
      propertyTypeUrl: this.urlService.URLS.OWNER_KPI9,
      iconUrl: 'assets/icons/kpi/svg/owner/2.svg',
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

  ownerMunicipalitySeriesNames: Record<number, () => string> = {
    0: () => this.lang.map.owners_count,
  };

  municipalityLabel = (item: { municipalityId: number }) =>
    this.lookupService.ownerMunicipalitiesMap[item.municipalityId]?.getNames() ?? '';

  ownerAreaSeriesNames: Record<number, () => string> = {
    0: () => this.lang.map.owners_count,
  };

  areaLabel = (item: { areaCode: number }) => this.lookupService.ownerDistrictMap[item.areaCode]?.getNames() ?? '';

  nationalityLabel = (item: { nationalityId: number }) => this.getNationalityNames(item.nationalityId);

  selectedNationalityId = 634;
  specialNationality = new Lookup().clone<Lookup>({ lookupKey: 82804, arName: 'أملاك دولة', enName: 'State property' });

  ownershipMunicipalityRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI14,
    hasPrice: false,
  };

  ownershipMunicipalitySeriesNames: Record<number, () => string> = {
    0: () => this.lang.map.ownerships_count,
  };

  ownershipAreaRootData = {
    chartDataUrl: this.urlService.URLS.OWNER_KPI15,
    hasPrice: false,
  };

  ownershipAreaSeriesNames: Record<number, () => string> = {
    0: () => this.lang.map.ownerships_count,
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

  ngAfterViewInit(): void {
    this.ownerRootItemSelected(this.selectedOwnerRoot);
    this.ownershipRootItemSelected(this.selectedOwnershipRoot);
    setTimeout(() => {
      this.nationalityCriteria = { ...this.criteria.criteria, nationalityCode: this.selectedNationalityId };
    }, 0);
  }

  switchTab(tab: 'ownership_indicators' | 'owner_indicators'): void {
    this.selectedTab = tab;
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };
  }

  ownerRootItemSelected(item: KpiRoot) {
    this.selectedOwnerRoot = item as KpiRoot & { nationalityCategoryId: number | null };
    this.ownerRootKpis.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.ownerNationalityCategoryCriteria = {
      ...this.criteria.criteria,
      nationalityCategoryId: this.selectedOwnerRoot.nationalityCategoryId,
    };
    setTimeout(() => {
      this.criteria.type = CriteriaType.USER;
    }, 0);
  }

  ownershipRootItemSelected(item?: KpiRoot) {
    if (!item) return;
    this.selectedOwnershipRoot = item as KpiRoot & { nationalityChartUrl: string };
    this.ownershipRootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });
  }

  onSelectedNationalityChanged(nationalityId: number) {
    this.selectedNationalityId = nationalityId;
    this.durationRootData.chartDataUrl = this.urlService.URLS[this._getChartDataUrl('OWNER_KPI16')];
    this.nationalityCriteria = { ...this.criteria.criteria, nationalityCode: nationalityId };

    this.ownershipMunicipalityRootData.chartDataUrl = this.urlService.URLS[this._getChartDataUrl('OWNER_KPI14')];
    this.ownershipAreaRootData.chartDataUrl = this.urlService.URLS[this._getChartDataUrl('OWNER_KPI15')];

    setTimeout(() => {
      this.criteria.type = CriteriaType.USER;
    }, 0);
  }

  getOwnershipTransactionType = () => OwnershipTransaction;

  ownershipTransactionsLoadFn = (criteria: CriteriaContract) =>
    this.dashboardService.loadOwnershipsTransactions(criteria);

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

  getStringSelectedCriteria(
    isMunicipalityRequired = true,
    isDistrictRequired = true,
    isNationalityRequired = false
  ): string {
    return this.sectionTitle.getSelectedCriteria(
      'owner',
      this.criteria.criteria,
      false,
      isDistrictRequired,
      false,
      isMunicipalityRequired,
      isNationalityRequired
    );
  }
}
