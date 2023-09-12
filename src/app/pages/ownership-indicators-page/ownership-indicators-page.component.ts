import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { PartialChartOptions } from '@app-types/partialChartOptions';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { PropertyBlockComponent } from '@components/property-block/property-block.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { OwnerCriteriaContract } from '@contracts/owner-criteria-contract';
import { CriteriaType } from '@enums/criteria-type';
import { NationalityCategories } from '@enums/nationality-categories';
import { ChartOptionsModel } from '@models/chart-options-model';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { OwnerDefaultValues } from '@models/owner-default-values';
import { OwnershipCountNationality } from '@models/ownership-count-nationality';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { AppChartTypesService } from '@services/app-chart-types.service';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { UrlService } from '@services/url.service';
import { minMaxAvg } from '@utils/utils';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel2';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskPipe } from 'ngx-mask';
import { Subject, forkJoin, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-owner-page',
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
    // TableComponent,
    // TableColumnTemplateDirective,
    // TableColumnHeaderTemplateDirective,
    // TableColumnCellTemplateDirective,
    // MatTableModule,
    FormatNumbersPipe,
    YoyIndicatorComponent,
    NgxMaskPipe,
    // MatSortModule,
    MatNativeDateModule,
  ],
  templateUrl: './ownership-indicators-page.component.html',
  styleUrls: ['./ownership-indicators-page.component.scss'],
})
export default class OwnershipIndicatorsPageComponent implements OnInit, AfterViewInit {
  @ViewChildren('carousel') carousel!: QueryList<CarouselComponent>;
  @ViewChildren('ownershipNationalitiesChart') ownershipNationalitiesChart!: QueryList<ChartComponent>;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  unitsService = inject(UnitsService);
  appChartTypesService = inject(AppChartTypesService);
  destroy$ = new Subject<void>();
  adapter = inject(DateAdapter);

  municipalities = this.lookupService.ownerLookups.municipalityList;
  propertyTypes = this.lookupService.ownerLookups.propertyTypeList;
  propertyUsages = this.lookupService.ownerLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.ownerLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);

  purposeKPIS = this.lookupService.ownerLookups.rentPurposeList;
  propertiesKPIS = this.lookupService.ownerLookups.propertyTypeList;

  minMaxArea: Partial<MinMaxAvgContract> = {};

  enableChangeAreaMinMaxValues = true;

  criteria!: {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  NationalityCategories = NationalityCategories;
  selectedNationalityCategory = NationalityCategories.QATARI;

  rootKPIS = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('total_number_of_properties_units'),
      this.lang.getEnglishTranslation('total_number_of_properties_units'),
      false,
      this.urlService.URLS.OWNER_KPI1,
      this.urlService.URLS.OWNER_KPI2,
      this.urlService.URLS.OWNER_KPI3,
      '',
      'assets/icons/kpi/2.png'
    ),
    new KpiRoot(
      4,
      this.lang.getArabicTranslation('total_number_of_qatari_owners'),
      this.lang.getEnglishTranslation('total_number_of_qatari_owners'),
      false,
      this.urlService.URLS.OWNER_KPI4,
      this.urlService.URLS.OWNER_KPI5,
      this.urlService.URLS.OWNER_KPI6,
      '',
      'assets/icons/kpi/4.png'
    ),

    new KpiRoot(
      7,
      this.lang.getArabicTranslation('total_number_of_non_qatari_owners'),
      this.lang.getEnglishTranslation('total_number_of_non_qatari_owners'),
      false,
      this.urlService.URLS.OWNER_KPI7,
      this.urlService.URLS.OWNER_KPI8,
      this.urlService.URLS.OWNER_KPI9,
      '',
      'assets/icons/kpi/8.png'
    ),
  ];

  totalOwnershipsRootKpi = new KpiRoot(
    10,
    this.lang.getArabicTranslation('total_number_of_ownerships'),
    this.lang.getEnglishTranslation('total_number_of_ownerships'),
    false,
    this.urlService.URLS.OWNER_KPI10,
    '',
    '',
    '',
    'assets/icons/kpi/7.png'
  );

  selectedRoot?: KpiRoot;
  selectedPurpose?: Lookup = this.lookupService.ownerLookups.rentPurposeList[0];

  selectedTab = 'ownership_indicators';

  ownershipNationalitiesChartData: OwnershipCountNationality[] = [];
  ownershipNationalitiesChartOptions: ChartOptionsModel = new ChartOptionsModel().clone<ChartOptionsModel>({
    ...this.appChartTypesService.mainChartOptions,
    ...this.appChartTypesService.yearlyStaticChartOptions,
    chart: { ...this.appChartTypesService.mainChartOptions.chart, type: 'bar' },
  });

  ngOnInit(): void {
    this._initializeChartsFormatters();
  }

  ngAfterViewInit(): void {}

  switchTab(tab: string): void {
    this.selectedTab = tab;
    this.carousel.setDirty();
    // this.chart.setDirty();
    // this.top10Chart.setDirty();
    setTimeout(() => {
      // this.updateChartDuration(this.selectedDurationType);
      // this.updateTop10Chart();
    });
  }

  isSelectedTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };
    if (type === CriteriaType.DEFAULT) this.rootItemSelected(this.rootKPIS[0]);
    // if (type === CriteriaType.DEFAULT) {
    //   // load default
    //   // this.dashboardService.loadOwnerDefaults(criteria as Partial<OwnerCriteriaContract>).subscribe((result) => {
    //   //   this.setDefaultRoots(result[0]);
    //   this.rootItemSelected(this.rootKPIS[0]);
    //   //   // this.selectTop10Chart(this.selectedTop10);
    //   // });
    // } else {
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

    this.dashboardService
      .loadKpiRoot(this.totalOwnershipsRootKpi, this.criteria.criteria)
      .pipe(take(1))
      .subscribe((value) => {
        if (!value.length) {
          this.totalOwnershipsRootKpi.setValue(0);
          this.totalOwnershipsRootKpi.setYoy(0);
        } else {
          this.totalOwnershipsRootKpi.setValue(value[value.length - 1].kpiVal);
          this.totalOwnershipsRootKpi.setYoy(value[value.length - 1].kpiYoYVal);
        }
      });

    this.rootItemSelected(this.selectedRoot);
    setTimeout(() => {
      this.updateOwnershipChartNationalityCategory(this.selectedNationalityCategory);
    }, 0);
    // this.selectTop10Chart(this.selectedTop10);
    // }
    // this.loadTransactions();
    // this.loadTransactionsBasedOnPurpose();
    // this.loadCompositeTransactions();
    // this.loadRoomCounts();
  }

  private setDefaultRoots(ownerDefaultValue?: OwnerDefaultValues) {
    if (!ownerDefaultValue) {
      this.rootKPIS.forEach((item) => {
        item.setValue(0);
        item.setYoy(0);
      });
    } else {
      this.rootKPIS.forEach((item) => {
        const value = `kpi${item.id}Val`;
        const yoy = `kpiYoY${item.id}`;
        item.setValue(ownerDefaultValue[value as keyof OwnerDefaultValues]);
        item.setYear(ownerDefaultValue.issueYear);
        item.setYoy(ownerDefaultValue[yoy as keyof OwnerDefaultValues]);
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
      // this.dashboardService.loadLineChartKpi(item, this.criteria.criteria),
    ]).subscribe(([subKPI /*lineChartData*/]) => {
      // this.selectedRootChartData = lineChartData;
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
      // this.updateChartDuration(this.selectedDurationType);
      // this.updateTop10Chart();
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

  updateOwnershipChartNationalityCategory(nationalityCategory: NationalityCategories) {
    this.selectedNationalityCategory = nationalityCategory;
    if (!this.ownershipNationalitiesChart?.length) return;
    const _criteria = { ...this.criteria.criteria } as OwnerCriteriaContract;
    delete (_criteria as any).nationalityCode;

    this.dashboardService
      .loadOwnershipCountNationality(_criteria, nationalityCategory)
      .pipe(take(1))
      .subscribe((data) => {
        this.ownershipNationalitiesChartData = data;
        const _minMaxAvg = minMaxAvg(this.ownershipNationalitiesChartData.map((item) => item.kpiVal));
        this.ownershipNationalitiesChart.first
          .updateOptions({
            series: [
              {
                name: this.lang.map.distribution_of_ownerships_according_to_nationality,
                data: this.ownershipNationalitiesChartData.map((item) => item.kpiVal),
              },
            ],
            xaxis: {
              categories: this.ownershipNationalitiesChartData.map((item) => item.nationalityInfo.getNames()),
            },
            colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
            ...this.appChartTypesService.yearlyStaticChartOptions,
          })
          .then();
      });

    const _minMaxAvg = minMaxAvg(this.ownershipNationalitiesChartData.map((item) => item.kpiVal));

    this.ownershipNationalitiesChart.first
      .updateOptions({
        series: [
          {
            name: this.lang.map.distribution_of_ownerships_according_to_nationality,
            data: this.ownershipNationalitiesChartData.map((item) => item.kpiVal),
          },
        ],
        xaxis: {
          categories: this.ownershipNationalitiesChartData.map((item) => item.nationalityInfo.getNames()),
        },
        colors: [this.appChartTypesService.chartColorsFormatter(_minMaxAvg)],
        ...this.appChartTypesService.yearlyStaticChartOptions,
      })
      .then();
  }

  get basedOnCriteria(): string {
    const generatedTitle: string[] = [];
    const municipality = this.getSelectedMunicipality();
    const district = this.getSelectedDistrict();
    const purpose = this.getSelectedPurpose();
    const propertyType = this.getSelectedPropertyType();
    municipality.length && generatedTitle.push(municipality);
    district.length && generatedTitle.push(district);
    propertyType.length && generatedTitle.push(propertyType);
    purpose.length && generatedTitle.push(purpose);
    return generatedTitle.length ? `(${generatedTitle.join(' , ')})` : '';
  }

  private getSelectedMunicipality(): string {
    if (this.criteria.criteria.municipalityId === -1) return '';
    return this.lookupService.sellMunicipalitiesMap[this.criteria.criteria.municipalityId].getNames() || '';
  }

  private getSelectedDistrict(): string {
    const areaCode = (this.criteria.criteria as OwnerCriteriaContract).areaCode;
    if (areaCode === -1) return '';
    return this.lookupService.sellDistrictMap[areaCode].getNames() || '';
  }

  private getSelectedPropertyType(): string {
    return this.criteria.criteria.propertyTypeList &&
      this.criteria.criteria.propertyTypeList.length == 1 &&
      this.criteria.criteria.propertyTypeList[0] !== -1
      ? this.lookupService.sellPropertyTypeMap[this.criteria.criteria.propertyTypeList[0]].getNames()
      : '';
  }

  private getSelectedPurpose(): string {
    return this.criteria.criteria.purposeList &&
      this.criteria.criteria.purposeList.length == 1 &&
      this.criteria.criteria.purposeList[0] !== -1
      ? this.lookupService.sellPurposeMap[this.criteria.criteria.purposeList[0]].getNames()
      : '';
  }

  private _initializeChartsFormatters() {
    this.ownershipNationalitiesChartOptions
      .addDataLabelsFormatter((val, opts) =>
        this.appChartTypesService.dataLabelsFormatter({ val, opts }, this.selectedRoot)
      )
      .addAxisYFormatter((val, opts) => this.appChartTypesService.axisYFormatter({ val, opts }, this.selectedRoot));
  }
}
