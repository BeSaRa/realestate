import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { AbstractControl, FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { DataService } from '@services/data.service';
import { KpiContract } from '@contracts/kpi-contract';
import { delay, merge, startWith, tap } from 'rxjs';
import { ChartOptions } from '@app-types/ChartOptions';
import { formatNumber } from '@utils/utils';
import { TranslationService } from '@services/translation.service';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CriteriaType } from '@enums/criteria-type';
import { LookupService } from '@services/lookup.service';

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
  ],
  templateUrl: './mortgage-indicators.component.html',
  styleUrls: ['./mortgage-indicators.component.scss'],
})
export default class MortgageIndicatorsComponent implements OnInit {
  dataService = inject(DataService);
  lang = inject(TranslationService);
  lookupService = inject(LookupService);

  control = new FormControl('', { nonNullable: true });
  fb = inject(UntypedFormBuilder);

  @ViewChild('mortCountsChart', { static: true }) mortCountChart!: ChartComponent;
  @ViewChild('mortValuesChart', { static: true }) mortValueChart!: ChartComponent;

  public mortVsSellCountsOptions: Partial<ChartOptions> = {};
  public mortVsSellValuesOptions: Partial<ChartOptions> = {};

  municipalities = this.lookupService.mortLookups.municipalityList;
  propertyUsage = this.lookupService.mortLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  propertyTypes = this.lookupService.mortLookups.propertyTypeList;
  rooms = this.lookupService.mortLookups.rooms;

  mortgageCounts?: KpiContract;
  mortgageValues?: KpiContract;

  ngOnInit() {}

  filterChange($event: { criteria: CriteriaContract; type: CriteriaType }): void {}
}
