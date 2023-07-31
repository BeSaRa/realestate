import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { TranslationService } from '@services/translation.service';
import { ButtonComponent } from '@components/button/button.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { LookupService } from '@services/lookup.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Lookup } from '@models/lookup';
import { range } from '@utils/utils';
import { Durations } from '@enums/durations';
import { InputComponent } from '@components/input/input.component';
import { MatIconModule } from '@angular/material/icon';
import { AppIcons } from '@constants/app-icons';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputPrefixDirective } from '@directives/input-prefix.directive';
import { ControlDirective } from '@directives/control.directive';
import { NgxMaskDirective } from 'ngx-mask';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CriteriaType } from '@enums/criteria-type';
import { HalfYearDurations } from '@enums/half-year-durations';

@Component({
  selector: 'app-transactions-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    SelectInputComponent,
    InputComponent,
    MatIconModule,
    IconButtonComponent,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    InputPrefixDirective,
    ControlDirective,
    NgxMaskDirective,
  ],
  providers: [DatePipe],
  templateUrl: './transactions-filter.component.html',
  styleUrls: ['./transactions-filter.component.scss'],
  animations: [
    trigger('openClose', [
      state(
        'true',
        style({
          height: '*',
        })
      ),
      state(
        'false',
        style({
          height: 0,
        })
      ),
      transition('true <=> false', animate('150ms ease-in-out')),
    ]),
  ],
})
export class TransactionsFilterComponent implements OnInit, OnDestroy {
  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  lookupService = inject(LookupService);
  datePipe = inject(DatePipe);

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
  // spaces = this.lookupService.lookups.spaces; // will use it later

  @Output()
  fromChanged = new EventEmitter<{ criteria: RentCriteriaContract; type: CriteriaType }>();

  form = this.fb.group({
    municipalityId: [],
    zoneId: [],
    propertyTypeList: [],
    rentPurposeList: [],
    issueDateQuarterList: [],
    // bedRoomsCount: [],
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
    rangeDate: [],
  });

  private destroy$: Subject<void> = new Subject();

  protected readonly AppIcons = AppIcons;
  displayYear = true;
  displayHalf = false;
  displayQuarter = false;
  displayRange = false;
  minDate: Date = new Date('2019-01-01');
  maxDate: Date = new Date();
  isOpened = false;

  toggleFilters(): void {
    this.isOpened = !this.isOpened;
  }

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
    this.listenToFormChanges();
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

  get issueDateFrom(): AbstractControl {
    return this.form.get('issueDateFrom') as AbstractControl;
  }

  get issueDateTo(): AbstractControl {
    return this.form.get('issueDateTo') as AbstractControl;
  }

  get rangeDate(): AbstractControl {
    return this.form.get('rangeDate') as AbstractControl;
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
      // bedRoomsCount: null,
      durationType: 1,
      issueDateYear: 2023,
      issueDateStartMonth: 1,
      issueDateEndMonth: 12,
    });
    this.sendFilter(CriteriaType.DEFAULT);
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
    this.displayYear = true;
    this.displayHalf = false;
    this.displayQuarter = false;
    this.displayRange = false;

    this.form.patchValue(
      {
        issueDateFrom: null,
        issueDateTo: null,
      },
      { emitEvent: false }
    );
  }

  private onlyDisplayHalfYear() {
    this.displayHalf = true;
    this.displayQuarter = false;
    this.displayRange = false;
    this.form.patchValue(
      {
        issueDateFrom: null,
        issueDateTo: null,
      },
      { emitEvent: false }
    );
  }

  private onlyDisplayQuarterYear() {
    this.displayHalf = false;
    this.displayQuarter = true;
    this.displayRange = false;
    this.form.patchValue(
      {
        issueDateFrom: null,
        issueDateTo: null,
      },
      { emitEvent: false }
    );
  }

  private onlyDisplayRangeYear() {
    this.displayHalf = false;
    this.displayQuarter = false;
    this.displayRange = true;
  }

  rangeChange() {
    this.rangeDate.patchValue(
      (this.issueDateFrom.value ? this.datePipe.transform(this.issueDateFrom.value, 'YYY-MM-dd') : '') +
        ' --- ' +
        (this.issueDateTo.value ? this.datePipe.transform(this.issueDateTo.value, 'YYY-MM-dd') : '')
    );
  }

  resetForm(): void {
    this.form.reset({}, { emitEvent: false });
    this.setDefaultValues();
  }

  search() {
    this.sendFilter(CriteriaType.USER);
  }

  sendFilter(criteriaType: CriteriaType): void {
    const value = this.form.value as Partial<RentCriteriaContract>;
    if (this.displayYear) {
      const date = new Date();
      date.getFullYear() === value.issueDateYear ? (value.issueDateEndMonth = date.getMonth() + 1) : null;
      value.issueDateQuarterList = [1, 2, 3, 4];
    } else if (this.displayHalf) {
      value.halfYearDuration === HalfYearDurations.FIRST_HALF
        ? (value.issueDateQuarterList = [1, 2])
        : (value.issueDateQuarterList = [3, 4]);
    }
    this.fromChanged.emit({ criteria: value as RentCriteriaContract, type: criteriaType });
  }

  private listenToFormChanges() {
    this.form.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(250)).subscribe(() => {
      this.sendFilter(CriteriaType.USER);
    });
  }
}
