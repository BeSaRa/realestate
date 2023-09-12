import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  computed,
  inject,
} from '@angular/core';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { DateAdapter, MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { AppIcons } from '@constants/app-icons';
import { CriteriaContract } from '@contracts/criteria-contract';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { ControlDirective } from '@directives/control.directive';
import { InputPrefixDirective } from '@directives/input-prefix.directive';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { CriteriaType } from '@enums/criteria-type';
import { Durations } from '@enums/durations';
import { HalfYearDurations } from '@enums/half-year-durations';
import { Lookup } from '@models/lookup';
import { LookupService } from '@services/lookup.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { range } from '@utils/utils';
import { CustomValidators } from '@validators/custom-validators';
import { NgxMaskDirective } from 'ngx-mask';
import { Subject, debounceTime, filter, takeUntil } from 'rxjs';

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
    InputSuffixDirective,
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
  @Input() indicatorType: 'sell' | 'rent' | 'mortgage' | 'owner' = 'rent';
  @Input() municipalities: Lookup[] = [];
  @Input() propertyTypes: Lookup[] = [];
  @Input() propertyUsages: Lookup[] = [];
  @Input() zones: Lookup[] = [];
  @Input() rooms: Lookup[] = [];
  @Input() furnitureStatus: Lookup[] = [];
  @Input() areas: Lookup[] = [];
  @Input() minMaxArea: Partial<MinMaxAvgContract> = {};
  @Input() minMaxRealestateValue: Partial<MinMaxAvgContract> = {};
  @Input() minMaxRentPaymentMonthly: Partial<MinMaxAvgContract> = {};

  @Output() fromChanged = new EventEmitter<{ criteria: CriteriaContract; type: CriteriaType }>();
  @Output() enableChangeAreaMinMaxValues = new EventEmitter<boolean>();
  @Output() enableChangeRentPaymentMonthlyMinMaxValues = new EventEmitter<boolean>();
  @Output() enableChangerealEstateValueMinMaxValues = new EventEmitter<boolean>();

  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  lookupService = inject(LookupService);
  datePipe = inject(DatePipe);
  stickyService = inject(StickyService);
  adapter = inject(DateAdapter);
  unitsService = inject(UnitsService);

  @HostListener('window:scroll')
  windowScroll(): void {
    this.stickyService.isFilterSticky.set(window.scrollY > 500);
  }

  isFilterSticky = computed(() => this.stickyService.isFilterSticky());

  filteredZones: Lookup[] = [];
  filteredAreas: Lookup[] = [];

  years: number[] = [];

  durations = this.lookupService.rentLookups.durations;
  halfYearDurations = this.lookupService.rentLookups.halfYearDurations;
  quarterYearDurations = this.lookupService.rentLookups.quarterYearDurations;
  months: { label: string; value: number }[] = [];
  // spaces = this.lookupService.rentLookups.spaces; // will use it later

  form = this.fb.group(
    {
      municipalityId: [],
      zoneId: [],
      propertyTypeList: [],
      purposeList: [],
      issueDateQuarterList: [],
      bedRoomsCount: [],
      furnitureStatus: [],
      unit: [],
      issueDateYear: [],
      issueDateMonth: [],
      issueDateStartMonth: [],
      issueDateEndMonth: [],
      issueDateFrom: [],
      issueDateTo: [],
      rentPaymentMonthlyPerUnitFrom: [
        '',
        [(control: AbstractControl) => CustomValidators.minValue(this.minMaxRentPaymentMonthly.min)(control)],
      ],
      rentPaymentMonthlyPerUnitTo: [
        '',
        [(control: AbstractControl) => CustomValidators.maxValue(this.minMaxRentPaymentMonthly.max)(control)],
      ],
      realEstateValueFrom: [
        '',
        [(control: AbstractControl) => CustomValidators.minValue(this.minMaxRealestateValue.min)(control)],
      ],
      realEstateValueTo: [
        '',
        [(control: AbstractControl) => CustomValidators.maxValue(this.minMaxRealestateValue.max)(control)],
      ],
      areaFrom: ['', [(control: AbstractControl) => CustomValidators.minValue(this.minMaxArea.min)(control)]],
      areaTo: ['', [(control: AbstractControl) => CustomValidators.maxValue(this.minMaxArea.max)(control)]],
      baseYear: [],
      streetNo: [],
      areaCode: [],
      // not related to the criteria
      durationType: [],
      halfYearDuration: [],
      quarterYearDuration: [],
      rangeDate: [],
    },
    {
      validators: [
        CustomValidators.compareFromTo('rentPaymentMonthlyPerUnitFrom', 'rentPaymentMonthlyPerUnitTo'),
        CustomValidators.compareFromTo('realEstateValueFrom', 'realEstateValueTo'),
        CustomValidators.compareFromTo('areaFrom', 'areaTo'),
      ],
    }
  );

  private destroy$: Subject<void> = new Subject();

  protected readonly AppIcons = AppIcons;
  displayYear = true;
  displayHalf = false;
  displayQuarter = false;
  displayMonth = false;
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
    this.years = range(this.isSell() ? 2006 : 2019, new Date().getFullYear());
    this.listenToMunicipalityChange();
    this.listenToPropertyTypeListChange();
    this.listenToRentPurposeListChange();
    this.listenToDurationTypeChange();
    this.setDefaultValues();
    this.listenToFormChanges();
    this.listenToIssueYearChange();
    this.listenToUnitChange();
  }

  get municipalityId(): AbstractControl {
    return this.form.get('municipalityId') as AbstractControl;
  }

  get areaCode(): AbstractControl {
    return this.form.get('areaCode') as AbstractControl;
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

  get purposeList(): AbstractControl {
    return this.form.get('purposeList') as AbstractControl;
  }

  get issueDateYear(): AbstractControl {
    return this.form.get('issueDateYear') as AbstractControl;
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

  get issueDateQuarterList(): AbstractControl {
    return this.form.get('issueDateQuarterList') as AbstractControl;
  }

  get unit(): AbstractControl {
    return this.form.get('unit') as AbstractControl;
  }

  listenToMunicipalityChange(): void {
    this.municipalityId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number) => {
      if (this.isSell() || this.isMort() || this.isOwner()) {
        this.filteredAreas = this.areas.filter((item) => item.municipalityId === value);
        !this.filteredAreas.find((i) => i.lookupKey === -1) &&
          this.filteredAreas.unshift(
            new Lookup().clone<Lookup>({
              arName: 'الكل',
              enName: 'All',
              lookupKey: -1,
            })
          );
        return;
      }
      this.filteredZones = this.zones.filter((item) => item.municipalityId === value);
      !this.filteredZones.find((i) => i.lookupKey === -1) && this.filteredZones.length > 1 &&
        this.filteredZones.unshift(
          new Lookup().clone<Lookup>({
            arName: 'الكل',
            enName: 'All',
            lookupKey: -1,
          })
        );
        this.filteredZones.length === 1 ? this.zoneId.setValue(this.filteredZones.at(0)?.lookupKey) : this.zoneId.setValue(-1) ;
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
    this.purposeList.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number[]) => {
      this.propertyUsages.forEach((item) => {
        (value ?? []).includes(-1)
          ? item.lookupKey !== -1
            ? (item.disabled = true)
            : (item.disabled = false)
          : (item.disabled = false);
      });
      this.purposeList.patchValue(value.includes(-1) ? [-1] : value.filter((item) => item !== -1), {
        emitEvent: false,
      });
    });
  }

  private setDefaultValues() {
    this.form.patchValue({
      municipalityId: this.isSell() || this.isMort() || this.isOwner() ? 4 : 1,
      propertyTypeList: [-1],
      purposeList: [-1],
      zoneId: -1,
      durationType: 1,
      issueDateYear: 2023,
      issueDateStartMonth: 1,
      issueDateEndMonth: 12,
      areaCode: -1,
      unit: this.unitsService.selectedUnit(),
      bedRoomsCount: undefined,
      furnitureStatus: this.furnitureStatus.length ? -1 : undefined,
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
        : value === Durations.MONTHLY
        ? this.onlyDisplayMonth()
        : value === Durations.DURATION
        ? this.onlyDisplayRangeYear()
        : null;
    });
  }

  private listenToIssueYearChange() {
    this.issueDateYear.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((_) => {
      if (this.durationType.value === Durations.MONTHLY) {
        this.setMonths();
      }
    });
  }

  private onlyDisplayYear() {
    this.displayYear = true;
    this.displayHalf = false;
    this.displayQuarter = false;
    this.displayMonth = false;
    this.displayRange = false;

    this.form.patchValue(
      {
        issueDateFrom: null,
        issueDateTo: null,
        issueDateMonth: null,
      },
      { emitEvent: false }
    );
  }

  private onlyDisplayHalfYear() {
    this.displayYear = false;
    this.displayHalf = true;
    this.displayQuarter = false;
    this.displayMonth = false;
    this.displayRange = false;
    this.form.patchValue(
      {
        issueDateFrom: null,
        issueDateTo: null,
        issueDateMonth: null,
      },
      { emitEvent: false }
    );
  }

  private onlyDisplayQuarterYear() {
    this.displayYear = false;
    this.displayHalf = false;
    this.displayQuarter = true;
    this.displayMonth = false;
    this.displayRange = false;
    this.form.patchValue(
      {
        issueDateFrom: null,
        issueDateTo: null,
        issueDateMonth: null,
      },
      { emitEvent: false }
    );
  }

  private onlyDisplayMonth() {
    this.displayYear = false;
    this.displayHalf = false;
    this.displayQuarter = false;
    this.displayMonth = true;
    this.displayRange = false;

    this.setMonths();

    this.form.patchValue(
      {
        issueDateFrom: null,
        issueDateTo: null,
      },
      { emitEvent: false }
    );
  }

  private setMonths() {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const _months = this.adapter.getMonthNames('long');
    this.months = _months.map((month, index) => ({
      label: month,
      value: index,
    }));

    if (this.issueDateYear.value === 2019) this.months = this.months.filter((month) => month.value >= 3);
    if (this.issueDateYear.value === new Date().getFullYear()) {
      this.months = this.months.filter((month) => month.value <= new Date().getMonth());
    }
  }

  private onlyDisplayRangeYear() {
    this.displayYear = false;
    this.displayHalf = false;
    this.displayQuarter = false;
    this.displayMonth = false;
    this.displayRange = true;
  }

  listenToUnitChange() {
    this.unit.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.unitsService.setUnit(value);
    });
  }

  rangeChange() {
    this.rangeDate.patchValue(
      (this.issueDateFrom.value ? this.datePipe.transform(this.issueDateFrom.value, 'YYY-MM-dd') : '') +
        ' --- ' +
        (this.issueDateTo.value ? this.datePipe.transform(this.issueDateTo.value, 'YYY-MM-dd') : '')
    );
    this.form.patchValue(
      {
        issueDateMonth: null,
      },
      { emitEvent: false }
    );
  }

  resetForm(): void {
    this.form.reset({}, { emitEvent: false });
    this.setDefaultValues();
  }

  search() {
    if (this.form.valid) this.sendFilter(CriteriaType.USER);
  }

  sendFilter(criteriaType: CriteriaType): void {
    let value = this.form.value;
    value = this._removeUnusedProps(value) as Partial<CriteriaContract>;
    if (this.displayYear) {
      const date = new Date();
      date.getFullYear() === value.issueDateYear ? (value.issueDateEndMonth = date.getMonth() + 1) : null;
      value.issueDateQuarterList = [1, 2, 3, 4];
    } else if (this.displayHalf) {
      value.halfYearDuration === HalfYearDurations.FIRST_HALF
        ? (value.issueDateQuarterList = [1, 2])
        : (value.issueDateQuarterList = [3, 4]);
    } else if (this.displayQuarter) {
      if (!this.issueDateQuarterList.value || !this.issueDateQuarterList.value.length) {
        return;
      } else if (this.displayRange) {
        if (!this.issueDateFrom.value || !this.issueDateTo.value) return;
      }
    }

    if (this.isMort()) {
      delete value.zoneId;
    }

    this.fromChanged.emit({ criteria: value as CriteriaContract, type: criteriaType });
    this.enableChangeAreaMinMaxValues.emit(this._enableChangeAreaMinMaxValues(this.form.value));
    this.enableChangerealEstateValueMinMaxValues.emit(this._enableChangeRealestateValueMinMaxValues(this.form.value));
    this.enableChangeRentPaymentMonthlyMinMaxValues.emit(
      this._enableChangeRentPaymentMonthlyMinMaxValues(this.form.value)
    );
  }

  private listenToFormChanges() {
    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(250),
        filter((_) => this.form.valid)
      )
      .subscribe(() => {
        this.sendFilter(CriteriaType.USER);
      });
  }

  _removeUnusedProps(value: any) {
    if (this.indicatorType === 'sell') {
      delete value.rentPaymentMonthlyPerUnitFrom;
      delete value.rentPaymentMonthlyPerUnitTo;
      delete value.zoneId;

      if (!this.filteredAreas.find((i) => i.lookupKey === this.areaCode.value)) {
        this.areaCode.patchValue(-1, { emitEvent: false });
        value.areaCode = -1;
      }
    }
    if (this.indicatorType === 'rent') {
      delete value.realEstateValueFrom;
      delete value.realEstateValueTo;
      delete value.areaCode;

      if (!this.filteredZones.find((i) => i.lookupKey === this.zoneId.value)) {
        this.zoneId.patchValue(-1, { emitEvent: false });
        value.zoneId = -1;
      }
    }
    Object.keys(value).forEach((key) => {
      if (typeof value[key] === 'string' && value[key] === '') delete value[key];
      if (Array.isArray(value[key]) && value[key].length === 0) delete value[key];
      value[key] ?? delete value[key];
    });
    return value;
  }

  private isIndicator(name: 'sell' | 'rent' | 'mortgage' | 'owner'): boolean {
    return this.indicatorType === name;
  }

  isSell(): boolean {
    return this.isIndicator('sell');
  }

  isRent(): boolean {
    return this.isIndicator('rent');
  }

  isMort(): boolean {
    return this.isIndicator('mortgage');
  }

  isOwner(): boolean {
    return this.isIndicator('owner');
  }

  private _enableChangeAreaMinMaxValues(value: any): boolean {
    const enable =
      !Object.prototype.hasOwnProperty.call(value, 'areaFrom') &&
      !Object.prototype.hasOwnProperty.call(value, 'areaTo');
    return enable;
  }
  private _enableChangeRealestateValueMinMaxValues(value: any): boolean {
    const enable =
      !Object.prototype.hasOwnProperty.call(value, 'realEstateValueFrom') &&
      !Object.prototype.hasOwnProperty.call(value, 'realEstateValueTo');
    return enable;
  }
  private _enableChangeRentPaymentMonthlyMinMaxValues(value: any): boolean {
    const enable =
      !Object.prototype.hasOwnProperty.call(value, 'rentPaymentMonthlyPerUnitFrom') &&
      !Object.prototype.hasOwnProperty.call(value, 'rentPaymentMonthlyPerUnitTo');
    return enable;
  }
}
