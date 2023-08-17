import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { DataService } from '@services/data.service';
import { KpiContract } from '@contracts/kpi-contract';
import { ChartOptions } from '@app-types/ChartOptions';
import { TranslationService } from '@services/translation.service';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CriteriaType } from '@enums/criteria-type';
import { LookupService } from '@services/lookup.service';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { KpiRoot } from '@models/kpiRoot';
import { UrlService } from '@services/url.service';
import { DashboardService } from '@services/dashboard.service';

@Component({
  selector: 'app-mortgage-indicators',
  standalone: true,
  imports: [
    CommonModule,
    BidiModule,
    ExtraHeaderComponent,
    MatAutocompleteModule,
    MatOptionModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    TransactionsFilterComponent,
    KpiRootComponent,
  ],
  templateUrl: './mortgage-indicators.component.html',
  styleUrls: ['./mortgage-indicators.component.scss'],
})
export default class MortgageIndicatorsComponent implements OnInit {
  lang = inject(TranslationService);
  lookupService = inject(LookupService);
  urlService = inject(UrlService);
  dashboardService = inject(DashboardService);

  criteria: { criteria: CriteriaContract; type: CriteriaType } = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  control = new FormControl('', { nonNullable: true });
  fb = inject(UntypedFormBuilder);

  @ViewChild('mortCountsChart', { static: true }) mortCountChart!: ChartComponent;
  @ViewChild('mortValuesChart', { static: true }) mortValueChart!: ChartComponent;

  public mortVsSellCountsOptions: Partial<ChartOptions> = {};
  public mortVsSellValuesOptions: Partial<ChartOptions> = {};

  municipalities = this.lookupService.mortLookups.municipalityList;
  propertyUsage = this.lookupService.mortLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  propertyTypes = this.lookupService.mortLookups.propertyTypeList;
  rooms = [] /*this.lookupService.mortLookups.rooms*/;
  areas = this.lookupService.mortLookups.districtList;

  rootKpis = [
    new KpiRoot(
      1,
      this.lang.getArabicTranslation('total_mortgage_transactions'),
      this.lang.getEnglishTranslation('total_mortgage_transactions'),
      false,
      this.urlService.URLS.MORT_KPI1,
      '',
      '',
      '',
      'assets/icons/kpi/1.png'
    ),
    new KpiRoot(
      3,
      this.lang.getArabicTranslation('the_total_number_of_mortgaged_units'),
      this.lang.getEnglishTranslation('the_total_number_of_mortgaged_units'),
      false,
      this.urlService.URLS.MORT_KPI3,
      '',
      '',
      '',
      'assets/icons/kpi/2.png'
    ),
    new KpiRoot(
      5,
      this.lang.getArabicTranslation('total_value_of_mortgage_transactions'),
      this.lang.getEnglishTranslation('total_value_of_mortgage_transactions'),
      true,
      this.urlService.URLS.MORT_KPI5,
      '',
      '',
      '',
      'assets/icons/kpi/6.png'
    ),
  ];

  // total_mortgage_transactions

  ngOnInit() {}

  filterChange($event: { criteria: CriteriaContract; type: CriteriaType }): void {
    this.criteria = $event;
    this.dashboardService.loadMortgageRoots(this.criteria.criteria).subscribe((values) => {
      this.rootKpis.map((item, index) => {
        item.value = (values[index] && values[index].kpiVal) || 0;
        item.yoy = (values[index] && values[index].kpiYoYVal) || 0;
      });
    });
  }

  rootItemSelected(item: KpiRoot): void {
    console.log(item);
  }
}
