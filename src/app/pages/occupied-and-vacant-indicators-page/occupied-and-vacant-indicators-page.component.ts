import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AreasChartComponent } from '@components/areas-chart/areas-chart.component';
import { ButtonComponent } from '@components/button/button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { MunicipalitiesChartComponent } from '@components/municipalities-chart/municipalities-chart.component';
import { PremiseTypesPopupComponent } from '@components/premise-types-popup/premise-types-popup.component';
import { PurposeListComponent } from '@components/purpose-list/purpose-list.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { StackedDurationChartComponent } from '@components/stacked-duration-chart/stacked-duration-chart.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { APP_PAGES_SECTIONS } from '@constants/injection-tokens';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { SectionGuardDirective } from '@directives/section-guard.directive';
import { TableActionDirective } from '@directives/table-action.directive';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { CriteriaType } from '@enums/criteria-type';
import { OccupationStatus } from '@enums/occupation-status';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { KpiBase } from '@models/kpi-base';
import { KpiPurpose } from '@models/kpi-purpose';
import { KpiRoot } from '@models/kpi-root';
import { OccupancyTransaction } from '@models/occupancy-transaction';
import { DashboardService } from '@services/dashboard.service';
import { DialogService } from '@services/dialog.service';
import { LookupService } from '@services/lookup.service';
import { SectionTitleService } from '@services/section-title.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-occupied-and-vacant-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
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
    SectionGuardDirective,
    MatProgressSpinnerModule,
    PurposeListComponent,
    TableActionDirective,
  ],
  templateUrl: './occupied-and-vacant-indicators-page.component.html',
  styleUrls: ['./occupied-and-vacant-indicators-page.component.scss'],
})
export default class OccupiedAndVacantIndicatorsPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  sectionTitle = inject(SectionTitleService);
  dialog = inject(DialogService);
  pageSections = inject(APP_PAGES_SECTIONS).OCCUPATION_PAGE;

  municipalities = this.lookupService.ovLookups.municipalityList;
  zones = this.lookupService.ovLookups.zoneList;
  areas = this.lookupService.ovLookups.districtList;
  premiseCategories = this.lookupService.ovLookups.premiseCategoryList;
  premiseTypes = this.lookupService.ovLookups.premiseTypeList;

  criteria = {} as {
    criteria: CriteriaContract & { occupancyStatus: number | null };
    type: CriteriaType;
  };

  occupationCriteria = this.criteria.criteria;

  durationsCriteria = { ...this.criteria.criteria, occupancyStatus: null } as typeof this.criteria.criteria;

  areasCriteria = { ...this.criteria.criteria, occupancyStatus: null } as typeof this.criteria.criteria;

  isSelectedDurationChartTypeMonthly = false;

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
  isLoadingPremiseTypes = false;

  readonly shownTypeKpisCount = 14;

  totalCountChartData = {
    chartDataUrl: this.urlService.URLS.OV_KPI4,
    hasPrice: false,
  };

  totalCountSeriesNames: Record<number, () => string> = {
    [OccupationStatus.VACANT]: () => this.lang.map.vacant,
    [OccupationStatus.OCCUPIED]: () => this.lang.map.occupied,
  };

  municipalitySeriesNames: Record<number, () => string> = {
    [OccupationStatus.VACANT]: () => this.lang.map.vacant,
    [OccupationStatus.OCCUPIED]: () => this.lang.map.occupied,
  };

  municipalityLabel = (item: { kpiVal: number; municipalityId: number }) => {
    return this.lookupService.ovMunicipalitiesMap[item.municipalityId].getNames();
  };

  areaSeriesNames: Record<number, () => string> = {
    [OccupationStatus.VACANT]: () => this.lang.map.vacant,
    [OccupationStatus.OCCUPIED]: () => this.lang.map.occupied,
  };

  areaLabel = (item: { kpiVal: number; zoneNo: number }) =>
    this.lookupService.ovZonesMap[item?.zoneNo]?.getNames() ?? '';

  readonly OccupationStatus = OccupationStatus;
  isTransactionsLoading = false;

  selectedOccupancyStatus = OccupationStatus.VACANT;

  transactionsTableCriteria = {
    ...this.criteria.criteria,
    occupancyStatus: this.selectedOccupancyStatus,
  };

  ngOnInit(): void {
    this.rootItemSelected(this.selectedRoot);
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria: criteria as CriteriaContract & { occupancyStatus: number | null }, type };
    this.areasCriteria = { ...this.criteria.criteria };
    this.durationsCriteria = { ...this.criteria.criteria, occupancyStatus: null };
    if (type === CriteriaType.DEFAULT) return;

    this.updateTransactionTableCriteria();
  }

  getRootCriteria(item: KpiRoot) {
    this.criteria.criteria.occupancyStatus = item?.id === -1 ? null : item?.id ?? 0;
    return this.criteria.criteria;
  }

  rootItemSelected(item?: KpiRoot) {
    if (!item) return;
    this.selectedRoot = item;

    this.occupationCriteria = { ...this.criteria.criteria, occupancyStatus: item?.id === -1 ? null : item?.id ?? 0 };

    this.rootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });
  }

  categorySelected(item: KpiPurpose) {
    this.selectedCategory = item;

    const _criteria = {
      ...this.criteria.criteria,
      occupancyStatus: this.selectedRoot.id === -1 ? null : this.selectedRoot.id,
      ['premiseCategoryList' as keyof CriteriaContract]: [item.id],
    };

    this.isLoadingPremiseTypes = true;

    this.selectedRoot &&
      this.dashboardService
        .loadPropertyTypeKpi(this.selectedRoot, _criteria)
        .pipe(
          take(1),
          finalize(() => (this.isLoadingPremiseTypes = false))
        )
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

  updateTransactionTableCriteria() {
    this.transactionsTableCriteria = {
      ...this.criteria.criteria,
      occupancyStatus: this.selectedOccupancyStatus,
    };
  }

  getTransactionType = () => OccupancyTransaction;

  transactionsLoadFn = (criteria: CriteriaContract) => {
    setTimeout(() => {
      this.isTransactionsLoading = true;
    }, 0);
    return this.dashboardService.loadOccupancyTransactions(criteria).pipe(
      finalize(() => {
        setTimeout(() => {
          this.isTransactionsLoading = false;
        }, 0);
      })
    );
  };

  onOccupancyStatusSelect(occupancyStatus: OccupationStatus) {
    if (this.selectedOccupancyStatus === occupancyStatus) return;
    this.selectedOccupancyStatus = occupancyStatus;
    this.updateTransactionTableCriteria();
  }

  getStringSelectedCriteria(isMunicipalityRequired = true, isZoneRequired = true, showYearInTitle = true): string {
    return this.sectionTitle.getSelectedCriteria(
      'ov',
      this.criteria.criteria,
      isZoneRequired,
      false,
      showYearInTitle,
      isMunicipalityRequired
    );
  }
}
