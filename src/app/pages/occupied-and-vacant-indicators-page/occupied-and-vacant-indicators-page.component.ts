import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PremiseTypesPopupComponent } from '@components/premise-types-popup/premise-types-popup.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { StackedDurationChartComponent } from '@components/stacked-duration-chart/stacked-duration-chart.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CriteriaType } from '@enums/criteria-type';
import { OccupationStatus } from '@enums/occupation-status';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { DashboardService } from '@services/dashboard.service';
import { DialogService } from '@services/dialog.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { BehaviorSubject, take } from 'rxjs';

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
  ],
  templateUrl: './occupied-and-vacant-indicators-page.component.html',
  styleUrls: ['./occupied-and-vacant-indicators-page.component.scss'],
})
export default class OccupiedAndVacantIndicatorsPageComponent {
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

  criteria!: {
    criteria: CriteriaContract & { occupancyStatus: number | null };
    type: CriteriaType;
  };

  criteriaSubject = new BehaviorSubject<CriteriaContract | undefined>(undefined);
  criteria$ = this.criteriaSubject.asObservable();

  rootKPIS = [
    new KpiRoot(
      -1,
      this.lang.getArabicTranslation('total_number_of_units'),
      this.lang.getEnglishTranslation('total_number_of_units'),
      false,
      this.urlService.URLS.OV_KPI1,
      this.urlService.URLS.OV_KPI2,
      this.urlService.URLS.OV_KPI3,
      '',
      'assets/icons/kpi/svg/1.svg'
    ),
    new KpiRoot(
      0,
      this.lang.getArabicTranslation('total_number_of_vacant_units'),
      this.lang.getEnglishTranslation('total_number_of_vacant_units'),
      false,
      this.urlService.URLS.OV_KPI1,
      this.urlService.URLS.OV_KPI2,
      this.urlService.URLS.OV_KPI3,
      '',
      'assets/icons/kpi/svg/3.svg'
    ),

    new KpiRoot(
      1,
      this.lang.getArabicTranslation('total_number_of_occupied_units'),
      this.lang.getEnglishTranslation('total_number_of_occupied_units'),
      false,
      this.urlService.URLS.OV_KPI1,
      this.urlService.URLS.OV_KPI2,
      this.urlService.URLS.OV_KPI3,
      '',
      'assets/icons/kpi/svg/8.svg'
    ),
  ];

  selectedRoot = this.rootKPIS[0];

  categoryKPIs = this.lookupService.ovLookups.premiseCategoryList;
  selectedCategory = this.lookupService.ovLookups.premiseCategoryList[0];

  typeKPIs = this.lookupService.ovLookups.premiseTypeList;
  filteredTypeKPIs = this.typeKPIs;

  readonly shownTypeKpisCount = 14;

  totalCountChartData = {
    chartDataUrl: this.urlService.URLS.OV_KPI4,
    hasPrice: false,
  };

  totalCountChartNames: Record<number, string> = {
    [OccupationStatus.VACANT]: this.lang.map.vacant,
    [OccupationStatus.OCCUPIED]: this.lang.map.occupied,
  };

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria: criteria as CriteriaContract & { occupancyStatus: number | null }, type };
    this.criteriaSubject.next(criteria);

    if (type === CriteriaType.DEFAULT) return;

    this.rootKPIS.map((item) => {
      const _criteria = { ...this.criteria.criteria, occupancyStatus: item?.id === -1 ? null : item?.id ?? 0 };

      this.dashboardService
        .loadKpiRoot(item, _criteria)
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
      .subscribe((subKPI) => {
        const _category = subKPI.reduce((acc, item) => {
          return { ...acc, [item['premiseCategoryId' as keyof KpiModel]]: item };
        }, {} as Record<number, KpiModel>);

        this.categoryKPIs = this.categoryKPIs.map((item) => {
          Object.prototype.hasOwnProperty.call(_category, item.lookupKey)
            ? (item.value = _category[item.lookupKey].kpiVal)
            : (item.value = 0);
          Object.prototype.hasOwnProperty.call(_category, item.lookupKey)
            ? (item.yoy = _category[item.lookupKey].kpiYoYVal)
            : (item.yoy = 0);
          return item;
        });
        this.selectedRoot && this.updateAllCategories(this.selectedRoot.value, this.selectedRoot.yoy);
        this.selectedCategory && this.categorySelected(this.selectedCategory);
        //   this.rootDataSubject.next(this.selectedRoot);
      });
  }

  updateAllCategories(value: number, yoy: number): void {
    const lookup = this.categoryKPIs.find((i) => i.lookupKey === -1);
    lookup && (lookup.value = value) && (lookup.yoy = yoy);
  }

  categorySelected(item: Lookup) {
    this.categoryKPIs.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });

    this.selectedCategory = item;

    const _criteria = {
      ...this.criteria.criteria,
      occupancyStatus: this.selectedRoot.id === -1 ? null : this.selectedRoot.id,
      ['premiseCategoryList' as keyof CriteriaContract]: [item.lookupKey],
    };

    this.selectedRoot &&
      this.dashboardService
        .loadPropertyTypeKpi(this.selectedRoot, _criteria)
        .pipe(take(1))
        .subscribe((result) => {
          const _types = result.reduce((acc, cur) => {
            return { ...acc, [cur['premiseTypeId' as keyof KpiModel]]: cur };
          }, {} as Record<number, KpiModel>);
          this.filteredTypeKPIs = this.typeKPIs
            .map((item) => {
              _types[item.lookupKey] ? (item.value = _types[item.lookupKey].kpiVal) : (item.value = 0);
              _types[item.lookupKey] ? (item.yoy = _types[item.lookupKey].kpiYoYVal) : (item.yoy = 0);
              return item;
            })
            .sort((a, b) => b.value - a.value)
            .filter((item) => item.value != 0);
        });
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
}
