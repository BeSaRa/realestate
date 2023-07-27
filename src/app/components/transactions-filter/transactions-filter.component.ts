import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslationService } from '@services/translation.service';
import { ButtonComponent } from '@components/button/button.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { LookupService } from '@services/lookup.service';

@Component({
  selector: 'app-transactions-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SelectInputComponent],
  templateUrl: './transactions-filter.component.html',
  styleUrls: ['./transactions-filter.component.scss'],
})
export class TransactionsFilterComponent {
  lang = inject(TranslationService);
  fb = inject(FormBuilder);
  lookupService = inject(LookupService);

  municipalities = this.lookupService.lookups.municipalityList;
  realestateAreaOptions = this.lookupService.lookups.propertyTypeList;
  realestateTypeOptions = this.lookupService.lookups.rentPurposeList;
  realestateUseOptions = this.lookupService.lookups.zoneList;
  numberOfRoomsOptions = ['غرفتين', 'غرفتين 1', 'غرفتين 2'];
  durationOptions = ['سنوي', 'سنوي 1', 'سنوي 2'];

  form = this.fb.group({
    municipalityId: [],
    propertyTypeList: [],
    zoneId: [],
    rentPurposeList: [],
    issueDateQuarterList: [],
    bedRoomsCount: [],
    issueDateYear: [],
    issueDateStartMonth: [],
    issueDateEndMonth: [],
    issueDateFrom: [],
    issueDateTo: [],
    rentPaymentMonthlyPerUnitFrom: [],
    rentPaymentMonthlyPerUnitTo: [],
    areaFrom: [],
    areaTo: [],
    baseYear: [],
    streetNo: [],
  });

  filtersForm = this.fb.nonNullable.group({
    municipal: this.municipalities[0],
    realestateArea: this.realestateAreaOptions[0],
    realestateType: this.realestateTypeOptions[0],
    realestateUse: this.realestateUseOptions[0],
    numberOfRooms: this.numberOfRoomsOptions[0],
    duration: this.durationOptions[0],
  });
}
