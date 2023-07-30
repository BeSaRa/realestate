import { Component, inject } from '@angular/core';
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
import { IvyCarouselModule } from 'angular-responsive-carousel2';
import { PropertyBlockComponent } from '@components/property-block/property-block.component';
import { BidiModule } from '@angular/cdk/bidi';
import { RentDefaultValues } from '@models/rent-default-values';
import { combineLatest, take } from 'rxjs';
import { KpiModel } from '@models/kpi-model';

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
  ],
  templateUrl: './rental-indicators-page.component.html',
  styleUrls: ['./rental-indicators-page.component.scss'],
})
export default class RentalIndicatorsPageComponent {
  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);

  criteria!: {
    criteria: RentCriteriaContract;
    type: CriteriaType;
  };

  rootKPIS = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('the_total_number_of_lease_contracts'),
      this.lang.getEnglishTranslation('the_total_number_of_lease_contracts'),
      true,
      this.urlService.URLS.RENT_KPI1,
      this.urlService.URLS.RENT_KPI2,
      this.urlService.URLS.RENT_KPI3
    ),
    new KpiRoot(
      4,
      this.lang.getArabicTranslation('the_total_number_of_properties_units_rented'),
      this.lang.getEnglishTranslation('the_total_number_of_properties_units_rented'),
      true,
      this.urlService.URLS.RENT_KPI4,
      this.urlService.URLS.RENT_KPI5,
      this.urlService.URLS.RENT_KPI6
    ),
    new KpiRoot(
      7,
      this.lang.getArabicTranslation('total_rented_space'),
      this.lang.getEnglishTranslation('total_rented_space'),
      true,
      this.urlService.URLS.RENT_KPI7,
      this.urlService.URLS.RENT_KPI8,
      this.urlService.URLS.RENT_KPI9
    ),
    new KpiRoot(
      10,
      this.lang.getArabicTranslation('the_total_value_of_lease_contracts'),
      this.lang.getEnglishTranslation('the_total_value_of_lease_contracts'),
      false,
      this.urlService.URLS.RENT_KPI10,
      this.urlService.URLS.RENT_KPI11,
      this.urlService.URLS.RENT_KPI12
    ),
    new KpiRoot(
      13,
      this.lang.getArabicTranslation('the_average_price_per_square_meter_square_foot'),
      this.lang.getEnglishTranslation('the_average_price_per_square_meter_square_foot'),
      false,
      this.urlService.URLS.RENT_KPI13,
      this.urlService.URLS.RENT_KPI14,
      this.urlService.URLS.RENT_KPI15
    ),
    new KpiRoot(
      16,
      this.lang.getArabicTranslation('average_rental_price_per_unit_property'),
      this.lang.getEnglishTranslation('average_rental_price_per_unit_property'),
      false,
      this.urlService.URLS.RENT_KPI16,
      this.urlService.URLS.RENT_KPI17,
      this.urlService.URLS.RENT_KPI18
    ),
  ];

  purposeKPIS = this.lookupService.lookups.rentPurposeList;

  propertiesKPIS = this.lookupService.lookups.propertyTypeList;

  selectedRoot?: KpiRoot;

  get priceList() {
    return this.rootKPIS.filter((item) => item.hasPrice);
  }

  get nonePriceList() {
    return this.rootKPIS.filter((item) => !item.hasPrice);
  }

  filterChange({ criteria, type }: { criteria: RentCriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria, type };

    if (type === CriteriaType.DEFAULT) {
      // load default
      this.dashboardService.loadRentDefaults(criteria).subscribe((result) => {
        this.setDefaultRoots(result[0]);
      });
    } else {
      this.rootKPIS.map((item) => {
        ((i) => {
          this.dashboardService
            .loadKpiRoot(i, this.criteria.criteria)
            .pipe(take(1))
            .subscribe((value) => {
              if (!value.length) {
                i.setValue(0);
                i.setYoy(0);
              } else {
                i.setValue(value[value.length - 1].kpiVal);
                i.setYoy(value[value.length - 1].kpiYoYVal);
              }
            });
        })(item);
      });
    }
  }

  rootItemSelected(item: KpiRoot) {
    if (item.selected) return;
    this.selectedRoot = item;

    this.rootKPIS.forEach((i) => {
      item !== i ? (i.selected = false) : item.toggleSelect();
    });

    combineLatest([
      this.dashboardService.loadPurposeKpi(item, this.criteria.criteria),
      this.dashboardService.loadPropertyTypeKpi(item, this.criteria.criteria),
    ]).subscribe(([subKPI, secondSubKPI]) => {
      const purpose = subKPI.reduce((acc, item) => {
        return { ...item, [item.rentPuropseId]: item };
      }, {} as Record<number, KpiModel>);
      const propertyTypes = secondSubKPI.reduce((acc, item) => {
        return { ...item, [item.propertyTypeId]: item };
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
      this.propertiesKPIS = this.propertiesKPIS.map((item) => {
        Object.prototype.hasOwnProperty.call(propertyTypes, item.lookupKey)
          ? (item.value = propertyTypes[item.lookupKey].kpiVal)
          : (item.value = 0);
        Object.prototype.hasOwnProperty.call(propertyTypes, item.lookupKey)
          ? (item.yoy = propertyTypes[item.lookupKey].kpiYoYVal)
          : (item.yoy = 0);
        return item;
      });
    });
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
}
