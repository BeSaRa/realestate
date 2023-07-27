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
import { Durations } from '@enums/durations';
import { InputComponent } from '@components/input/input.component';

@Component({
  selector: 'app-transactions-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SelectInputComponent, InputComponent],
  templateUrl: './transactions-filter.component.html',
  styleUrls: ['./transactions-filter.component.scss'],
})
export class TransactionsFilterComponent implements OnInit, OnDestroy {
  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  lookupService = inject(LookupService);

  municipalities = this.lookupService.lookups.municipalityList;
  propertyTypes = this.lookupService.lookups.propertyTypeList;
  propertyUsages = this.lookupService.lookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  zones = this.lookupService.lookups.zoneList;
  rooms = this.lookupService.lookups.rooms;
  filteredZones: Lookup[] = [];

  years = range(2019, new Date().getFullYear());

  durations = this.lookupService.lookups.durations;
  halfYearDurations = this.lookupService.lookups.halfYearDurations;
  quarterYearDurations = this.lookupService.lookups.quarterYearDurations;

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
    // not related to the criteria
    durationType: [],
    halfYearDuration: [],
    quarterYearDuration: [],
  });

  private destroy$: Subject<void> = new Subject();

  displayHalf = false;
  displayQuarter = false;
  displayRange = false;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToMunicipalityChange();
    this.listenToPropertyTypeListChange();
    this.listenToRentPurposeListChange();
    this.listenToDurationTypeChange();
    this.setDefaultValues();

    console.log(this.propertyUsages);
  }

  get municipalityId(): AbstractControl {
    return this.form.get('municipalityId') as AbstractControl;
  }

  get zoneId(): AbstractControl {
    return this.form.get('zoneId') as AbstractControl;
  }

  get durationType(): AbstractControl {
    return this.form.get('durationType') as AbstractControl;
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
      this.propertyUsages.forEach((item) => {
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
      propertyTypeList: [-1],
      rentPurposeList: [-1],
      zoneId: 4,
      bedRoomsCount: 0,
      durationType: 1,
      issueDateYear: 2019,
    });
  }

  private listenToDurationTypeChange() {
    this.durationType.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: Durations) => {
      value === Durations.YEARLY
        ? this.onlyDisplayYear()
        : value === Durations.HALF_YEARLY
        ? this.onlyDisplayHalfYear()
        : value === Durations.QUARTER_YEARLY
        ? this.onlyDisplayQuarterYear()
        : value === Durations.DURATION
        ? this.onlyDisplayRangeYear()
        : null;
    });
  }

  private onlyDisplayYear() {
    this.displayHalf = false;
    this.displayQuarter = false;
    this.displayRange = false;
  }

  private onlyDisplayHalfYear() {
    this.displayHalf = true;
    this.displayQuarter = false;
    this.displayRange = false;
  }

  private onlyDisplayQuarterYear() {
    this.displayHalf = false;
    this.displayQuarter = true;
    this.displayRange = false;
  }

  private onlyDisplayRangeYear() {
    this.displayHalf = false;
    this.displayQuarter = false;
    this.displayRange = true;
  }
}
