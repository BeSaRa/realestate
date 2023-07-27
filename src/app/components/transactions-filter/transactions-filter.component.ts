import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { TranslationService } from '@services/translation.service';
import { ButtonComponent } from '@components/button/button.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { LookupService } from '@services/lookup.service';
import { Subject, takeUntil } from 'rxjs';
import { Lookup } from '@models/lookup';
import { range } from '@utils/utils';

@Component({
  selector: 'app-transactions-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SelectInputComponent],
  templateUrl: './transactions-filter.component.html',
  styleUrls: ['./transactions-filter.component.scss'],
})
export class TransactionsFilterComponent implements OnInit, OnDestroy {
  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  lookupService = inject(LookupService);

  municipalities = this.lookupService.lookups.municipalityList;
  propertyTypes = this.lookupService.lookups.propertyTypeList;
  propertyUsages = this.lookupService.lookups.rentPurposeList;
  zones = this.lookupService.lookups.zoneList;
  rooms = this.lookupService.lookups.rooms;
  filteredZones: Lookup[] = [];

  years = range(2019, new Date().getFullYear());

  durationOptions = ['سنوي', 'سنوي 1', 'سنوي 2'];

  form = this.fb.group({
    municipalityId: [],
    zoneId: [],
    propertyTypeList: [],
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
  private destroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToMunicipalityChange();
    this.listenToPropertyTypeListChange();
    this.listenToRentPurposeListChange();
    this.setDefaultValues();

    console.log(this.years);
  }

  get municipalityId(): AbstractControl {
    return this.form.get('municipalityId') as AbstractControl;
  }

  get zoneId(): AbstractControl {
    return this.form.get('zoneId') as AbstractControl;
  }

  get propertyTypeList(): AbstractControl {
    return this.form.get('propertyTypeList') as AbstractControl;
  }

  get rentPurposeList(): AbstractControl {
    return this.form.get('rentPurposeList') as AbstractControl;
  }

  listenToMunicipalityChange(): void {
    this.municipalityId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number) => {
      this.filteredZones = this.zones.filter((item) => item.municipalityId === value);
    });
  }

  listenToPropertyTypeListChange(): void {
    this.propertyTypeList.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number[]) => {
      this.propertyTypes.forEach((item) => {
        (value ?? []).includes(-1)
          ? item.lookupKey !== -1
            ? (item.disabled = true)
            : (item.disabled = false)
          : (item.disabled = false);
      });
      this.propertyTypeList.patchValue(value.includes(-1) ? [-1] : value.filter((item) => item !== -1), {
        emitEvent: false,
      });
    });
  }

  listenToRentPurposeListChange(): void {
    this.rentPurposeList.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number[]) => {
      this.propertyTypes.forEach((item) => {
        (value ?? []).includes(-1)
          ? item.lookupKey !== -1
            ? (item.disabled = true)
            : (item.disabled = false)
          : (item.disabled = false);
      });
      this.rentPurposeList.patchValue(value.includes(-1) ? [-1] : value.filter((item) => item !== -1), {
        emitEvent: false,
      });
    });
  }

  private setDefaultValues() {
    this.form.patchValue({
      municipalityId: this.municipalities[0].lookupKey,
      zoneId: 4,
      propertyTypeList: [-1],
      rentPurposeList: [-1],
      bedRoomsCount: [0],
    });
  }
}
