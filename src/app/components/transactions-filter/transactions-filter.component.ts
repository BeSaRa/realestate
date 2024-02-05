import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
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
import { ControlDirective } from '@directives/control.directive';
import { InputPrefixDirective } from '@directives/input-prefix.directive';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { OnlyCurrentLangLettersDirective } from '@directives/only-current-lang-letters.directive';
import { CriteriaType } from '@enums/criteria-type';
import { Durations } from '@enums/durations';
import { HalfYearDurations } from '@enums/half-year-durations';
import { ParamRangeField } from '@enums/param-range-field';
import { SqUnit } from '@enums/sq-unit';
import { FilterMessage } from '@models/filter-message';
import { Lookup } from '@models/lookup';
import { ParamRange } from '@models/param-range';
import { FilterMessagesService } from '@services/filter-messages.service';
import { LookupService } from '@services/lookup.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { range } from '@utils/utils';
import { CustomValidators } from '@validators/custom-validators';
import { NgResizeObserver, ngResizeObserverProviders } from 'ng-resize-observer';
import { NgxMaskDirective } from 'ngx-mask';
import { Subject, debounceTime, filter, map, take, takeUntil, tap } from 'rxjs';

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
    OnlyCurrentLangLettersDirective,
  ],
  providers: [DatePipe, ...ngResizeObserverProviders],
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
  @Input() indicatorType: 'sell' | 'rent' | 'mortgage' | 'owner' | 'ov' | 'broker' = 'rent';
  @Input() municipalities: Lookup[] = [];
  @Input() propertyTypes: Lookup[] = [];
  @Input() propertyUsages: Lookup[] = [];
  @Input() zones: Lookup[] = [];
  @Input() rooms: Lookup[] = [];
  @Input() furnitureStatus: Lookup[] = [];
  @Input() areas: Lookup[] = [];
  @Input() nationalities: Lookup[] = [];
  @Input() ownerTypes: Lookup[] = [];
  @Input() premiseCategories: Lookup[] = [];
  @Input() premiseTypes: Lookup[] = [];
  @Input() brokerCategoryList: Lookup[] = [];
  @Input() brokerTypeList: Lookup[] = [];
  @Input() paramsRange: ParamRange[] = [];

  @Output() fromChanged = new EventEmitter<{ criteria: CriteriaContract; type: CriteriaType }>();

  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  lookupService = inject(LookupService);
  datePipe = inject(DatePipe);
  stickyService = inject(StickyService);
  adapter = inject(DateAdapter);
  unitsService = inject(UnitsService);
  filterMessageService = inject(FilterMessagesService);
  resize$ = inject(NgResizeObserver);

  private destroy$: Subject<void> = new Subject();

  @HostListener('window:scroll')
  windowScroll(): void {
    this.stickyService.scrollY.set(window.scrollY);
  }

  prevHeight = 0;
  height$ = this.resize$
    .pipe(
      takeUntil(this.destroy$),
      map((entry) => entry.contentRect.height),
      filter((height) => height !== this.prevHeight),
      filter(() => !this.stickyService.isFilterSticky()),
      tap((height) => (this.prevHeight = height)),
      tap((height) => this.stickyService.filterHeigtht.set(height))
    )
    .subscribe();

  filteredZones: Lookup[] = [];
  filteredAreas: Lookup[] = [];

  years: number[] = [];

  durations = this.lookupService.rentLookups.durations;
  halfYearDurations = this.lookupService.rentLookups.halfYearDurations;
  quarterYearDurations = this.lookupService.rentLookups.quarterYearDurations;
  months: { label: string; value: number }[] = [];
  // spaces = this.lookupService.rentLookups.spaces; // will use it later

  rentValueRange: ParamRange | undefined;
  sellValueRange: ParamRange | undefined;
  mortgageValueRange: ParamRange | undefined;
  areaRange: ParamRange | undefined;

  areaMaxLength = 10;
  rentPaymentMaxLength = 10;
  realEstateMaxLength = 10;
  mortgageMaxLength = 10;

  form = this.fb.group(
    {
      areaCode: [],
      municipalityId: [],
      propertyTypeList: [],
      purposeList: [],
      issueDateQuarterList: [],
      bedRoomsCount: [null],
      furnitureStatus: [],

      issueDateYear: [],
      issueDateMonth: [],
      issueDateStartMonth: [],
      issueDateEndMonth: [],
      issueDateFrom: [],
      issueDateTo: [],
      rentPaymentMonthlyPerUnitFrom: [
        '',
        [
          (control: AbstractControl) => CustomValidators.minValue(this.rentValueRange?.minVal)(control),
          (control: AbstractControl) => CustomValidators.maxValue(this.rentValueRange?.maxVal)(control),
        ],
      ],
      rentPaymentMonthlyPerUnitTo: [
        '',
        [
          (control: AbstractControl) => CustomValidators.minValue(this.rentValueRange?.minVal)(control),
          (control: AbstractControl) => CustomValidators.maxValue(this.rentValueRange?.maxVal)(control),
        ],
      ],
      realEstateValueFrom: [
        '',
        [
          (control: AbstractControl) => CustomValidators.minValue(this.sellValueRange?.minVal)(control),
          (control: AbstractControl) => CustomValidators.maxValue(this.sellValueRange?.maxVal)(control),
        ],
      ],
      realEstateValueTo: [
        '',
        [
          (control: AbstractControl) => CustomValidators.minValue(this.sellValueRange?.minVal)(control),
          (control: AbstractControl) => CustomValidators.maxValue(this.sellValueRange?.maxVal)(control),
        ],
      ],
      areaFrom: [
        null,
        [
          (control: AbstractControl) => CustomValidators.minValue(this.areaRange?.minVal)(control),
          (control: AbstractControl) => CustomValidators.maxValue(this.areaRange?.maxVal)(control),
        ],
      ],
      areaTo: [
        null,
        [
          (control: AbstractControl) => CustomValidators.minValue(this.areaRange?.minVal)(control),
          (control: AbstractControl) => CustomValidators.maxValue(this.areaRange?.maxVal)(control),
        ],
      ],
      baseYear: [],
      zoneId: [],
      streetNo: [],
      nationalityCode: [],
      ownerCategoryCode: [],
      premiseCategoryList: [],
      premiseTypeList: [],
      brokerCategoryId: [],
      brokerName: [],

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

  unitsControl = new FormControl(this.unitsService.selectedUnit());

  protected readonly AppIcons = AppIcons;
  displayYear = true;
  displayHalf = false;
  displayQuarter = false;
  displayMonth = false;
  displayRange = false;
  minDate: Date = new Date('2019-01-01');
  maxDate: Date = new Date();
  isOpened = false;

  filterMessages: FilterMessage[] = [];

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

  get streetNo(): AbstractControl {
    return this.form.get('streetNo') as AbstractControl;
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

  get nationalityCode(): AbstractControl {
    return this.form.get('nationalityCode') as AbstractControl;
  }

  get ownerCategoryCode(): AbstractControl {
    return this.form.get('ownerCategoryCode') as AbstractControl;
  }

  get premiseCategoryList(): AbstractControl {
    return this.form.get('premiseCategoryList') as AbstractControl;
  }

  get premiseTypeList(): AbstractControl {
    return this.form.get('premiseTypeList') as AbstractControl;
  }

  get brokerCategoryId(): AbstractControl {
    return this.form.get('brokerCategoryId') as AbstractControl;
  }

  ngOnInit(): void {
    if (!this.isSell()) this.unitsControl.disable();
    if (this.isRent()) this.nationalityCode.disable();
    this.streetNo.disable();

    this.years = range(this.isSell() || this.isMort() ? 2006 : 2019, new Date().getFullYear());
    this.listenToMunicipalityChange();
    this.listenToLangChange();
    this.listenToPropertyTypeListChange();
    this.listenToRentPurposeListChange();
    this.listenToDurationTypeChange();
    this.listenToFormChanges();
    this.listenToIssueYearChange();
    this.listenToUnitChange();
    // this.listenToNationalityChange(); // it needs edit from be
    // this.listenToOwnerCategoryChange(); // it needs edit from be
    this.listenToPremiseCategoryListChange();
    this.listenToPremiseTypeListChange();
    this.setDefaultValues();
    this.setParamsRange();
    this.initializeUnitAccordingToPage();

    this.isMort() && this.unitsService.setUnit(SqUnit.SQUARE_METER);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  toggleFilters(): void {
    this.isOpened = !this.isOpened;
  }

  private setDefaultValues() {
    this.form.patchValue({
      municipalityId: -1,
      propertyTypeList: [-1],
      purposeList: [-1],
      zoneId: -1,
      durationType: 1,
      issueDateYear: 2023,
      issueDateStartMonth: 1,
      issueDateEndMonth: 12,
      areaCode: -1,
      unit: this.isRent() ? 1 : 2,
      bedRoomsCount: null,
      furnitureStatus: this.furnitureStatus.length ? -1 : undefined,
      nationalityCode: -1,
      ownerCategoryCode: -1,
      premiseCategoryList: [-1],
      premiseTypeList: [-1],
      brokerCategoryId: 2,
    });
    this.sendFilter(CriteriaType.DEFAULT);
  }

  listenToMunicipalityChange(): void {
    this.municipalityId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
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
        this.areaCode.patchValue(-1, { emitEvent: false });
        return;
      }
      this.filteredZones = this.zones.filter((item) => item.municipalityId === value);
      !this.filteredZones.find((i) => i.lookupKey === -1) &&
        this.filteredZones.unshift(
          new Lookup().clone<Lookup>({
            arName: 'الكل',
            enName: 'All',
            lookupKey: -1,
          })
        );
      this.filteredZones.length === 1
        ? this.zoneId.setValue(this.filteredZones.at(0)?.lookupKey)
        : this.zoneId.setValue(-1);
    });
  }

  listenToLangChange() {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.isSell() || this.isMort() || this.isOwner()) {
        this.filteredAreas = this.areas.filter((item) => item.municipalityId === this.municipalityId.value);
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
      this.filteredZones = this.zones.filter((item) => item.municipalityId === this.municipalityId.value);
      !this.filteredZones.find((i) => i.lookupKey === -1) &&
        this.filteredZones.unshift(
          new Lookup().clone<Lookup>({
            arName: 'الكل',
            enName: 'All',
            lookupKey: -1,
          })
        );
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

  // until edit from be
  listenToNationalityChange(): void {
    this.nationalityCode.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number) => {
      // this.nationalities.forEach((item) => {
      //   (value ?? []).includes(-1)
      //     ? item.lookupKey !== -1
      //       ? (item.disabled = true)
      //       : (item.disabled = false)
      //     : (item.disabled = false);
      // });
      // this.nationalityCode.patchValue(value.includes(-1) ? [-1] : value.filter((item) => item !== -1), {
      //   emitEvent: false,
      // });
    });
  }

  listenToOwnerCategoryChange(): void {
    this.ownerCategoryCode.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number) => {
      // this.ownerTypes.forEach((item) => {
      //   (value ?? []).includes(-1)
      //     ? item.lookupKey !== -1
      //       ? (item.disabled = true)
      //       : (item.disabled = false)
      //     : (item.disabled = false);
      // });
      // this.ownerCategoryCode.patchValue(value.includes(-1) ? [-1] : value.filter((item) => item !== -1), {
      //   emitEvent: false,
      // });
    });
  }

  listenToUnitChange() {
    this.unitsControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.unitsService.setUnit(value as SqUnit);
    });
  }

  initializeUnitAccordingToPage() {
    this.unitsControl.setValue(this.isMort() || this.isSell() ? SqUnit.SQUARE_FEET : SqUnit.SQUARE_METER);
  }

  listenToPremiseCategoryListChange(): void {
    this.premiseCategoryList.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number[]) => {
      this.premiseCategories.forEach((item) => {
        (value ?? []).includes(-1)
          ? item.lookupKey !== -1
            ? (item.disabled = true)
            : (item.disabled = false)
          : (item.disabled = false);
      });
      this.premiseCategoryList.patchValue(value.includes(-1) ? [-1] : value.filter((item) => item !== -1), {
        emitEvent: false,
      });
    });
  }

  listenToPremiseTypeListChange(): void {
    this.premiseTypeList.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number[]) => {
      this.premiseTypes.forEach((item) => {
        (value ?? []).includes(-1)
          ? item.lookupKey !== -1
            ? (item.disabled = true)
            : (item.disabled = false)
          : (item.disabled = false);
      });
      this.premiseTypeList.patchValue(value.includes(-1) ? [-1] : value.filter((item) => item !== -1), {
        emitEvent: false,
      });
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
        halfYearDuration: HalfYearDurations.FIRST_HALF,
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
        issueDateQuarterList: [1],
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
        issueDateMonth: 1,
      },
      { emitEvent: false }
    );
  }

  private setMonths() {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const _months = this.adapter.getMonthNames('long');
    this.months = _months.map((month, index) => ({
      label: month,
      value: index + 1,
    }));

    if (this.issueDateYear.value === 2019 && !(this.isSell() || this.isMort()))
      this.months = this.months.filter((month) => month.value >= 4);
    if (this.issueDateYear.value === new Date().getFullYear()) {
      this.months = this.months.filter((month) => month.value <= new Date().getMonth() + 1);
    }
  }

  private onlyDisplayRangeYear() {
    this.displayYear = false;
    this.displayHalf = false;
    this.displayQuarter = false;
    this.displayMonth = false;
    this.displayRange = true;
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
    let value = { ...this.form.value };
    if (!this.unitsService.isMeterSelected() && !this.isMort()) {
      // the backend is assuming that always this filter value is in meters
      if (value.areaFrom !== null && value.areaFrom !== undefined && value.areaFrom !== '')
        value.areaFrom = value.areaFrom / 10.8;
      if (value.areaTo !== null && value.areaTo !== undefined && value.areaFrom !== '')
        value.areaTo = value.areaTo / 10.8;
    }

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
      }
    } else if (this.displayMonth) {
      value.issueDateStartMonth = this.form.value.issueDateMonth;
      value.issueDateEndMonth = this.form.value.issueDateMonth;
      value.issueDateQuarterList = [1, 2, 3, 4];
    } else if (this.displayRange) {
      if (!this.issueDateFrom.value || !this.issueDateTo.value) return;
      value.issueDateFrom = this.datePipe.transform(this.issueDateFrom.value, 'YYY-MM-dd');
      value.issueDateTo = this.datePipe.transform(this.issueDateTo.value, 'YYY-MM-dd');
    }

    value = this._removeUnusedProps(value) as Partial<CriteriaContract>;
    if (criteriaType !== CriteriaType.DEFAULT) this.checkForCurrentCriteriaMessages(value);
    this.fromChanged.emit({ criteria: value as CriteriaContract, type: criteriaType });
  }

  private listenToFormChanges() {
    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(250),
        filter(() => this.form.valid)
      )
      .subscribe(() => {
        this.sendFilter(CriteriaType.USER);
      });
  }

  _removeUnusedProps(value: any) {
    delete value.durationType;
    if (this.isSell()) {
      delete value.rentPaymentMonthlyPerUnitFrom;
      delete value.rentPaymentMonthlyPerUnitTo;
      delete value.zoneId;

      if (!this.filteredAreas.find((i) => i.lookupKey === this.areaCode.value)) {
        this.areaCode.patchValue(-1, { emitEvent: false });
        value.areaCode = -1;
      }
    }
    if (this.isRent()) {
      delete value.realEstateValueFrom;
      delete value.realEstateValueTo;
      delete value.areaCode;

      if (!this.filteredZones.find((i) => i.lookupKey === this.zoneId.value)) {
        this.zoneId.patchValue(-1, { emitEvent: false });
        value.zoneId = -1;
      }
    }
    if (this.isMort()) {
      delete value.zoneId;
    }
    if (this.isOwner()) {
      delete value.issueDateQuarterList;
      delete value.issueDateStartMonth;
      delete value.issueDateEndMonth;
      delete value.issueDateFrom;
      delete value.issueDateTo;

      delete value.realEstateValueFrom;
      delete value.realEstateValueTo;
      delete value.rentPaymentMonthlyPerUnitFrom;
      delete value.rentPaymentMonthlyPerUnitTo;
    }

    if (this.isOV()) {
      delete value.areaCode;
      delete value.propertyTypeList;
      delete value.purposeList;

      delete value.realEstateValueFrom;
      delete value.realEstateValueTo;
      delete value.rentPaymentMonthlyPerUnitFrom;
      delete value.rentPaymentMonthlyPerUnitTo;
    }

    if (this.isBroker()) {
      value = {
        municipalityId: value.municipalityId,
        brokerCategoryId: value.brokerCategoryId,
        brokerName: value.brokerName,
      };
    }

    if (!this.isOwner()) {
      delete value.nationalityCode;
      delete value.ownerCategoryCode;
    }

    if (!this.isOV()) {
      delete value.premiseCategoryList;
      delete value.premiseTypeList;
    }

    if (!this.isBroker()) {
      delete value.brokerCategoryId;
      delete value.brokerName;
    }

    Object.keys(value).forEach((key) => {
      if ((typeof value[key] === 'string' && value[key] === '') || value[key] === null) {
        delete value[key];
      }
      if (Array.isArray(value[key]) && value[key].length === 0) delete value[key];
      typeof value[key] === 'undefined' ? delete value[key] : null;
    });
    return value;
  }

  private isIndicator(name: 'sell' | 'rent' | 'mortgage' | 'owner' | 'ov' | 'broker'): boolean {
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

  isOV(): boolean {
    return this.isIndicator('ov');
  }

  isBroker(): boolean {
    return this.isIndicator('broker');
  }

  private setParamsRange() {
    const _rentValueRange = this.paramsRange.filter(
      (paramRange) => paramRange.fieldName === ParamRangeField.RENT_VALUE
    );
    this.rentValueRange = _rentValueRange.length ? _rentValueRange[0] : undefined;
    this.rentValueRange &&
      (this.rentPaymentMaxLength =
        this.rentValueRange.maxVal.toString().length + Math.ceil(this.rentValueRange.maxVal.toString().length / 3));

    const _sellValueRange = this.paramsRange.filter(
      (paramRange) => paramRange.fieldName === ParamRangeField.SELL_VALUE
    );
    this.sellValueRange = _sellValueRange.length ? _sellValueRange[0] : undefined;
    this.sellValueRange &&
      (this.realEstateMaxLength =
        this.sellValueRange.maxVal.toString().length + Math.ceil(this.sellValueRange.maxVal.toString().length / 3));

    const _mortgageValueRange = this.paramsRange.filter(
      (paramRange) => paramRange.fieldName === ParamRangeField.MORTGAGE_VALUE
    );
    this.mortgageValueRange = _mortgageValueRange.length ? _mortgageValueRange[0] : undefined;
    this.mortgageValueRange &&
      (this.mortgageMaxLength =
        this.mortgageValueRange.maxVal.toString().length +
        Math.ceil(this.mortgageValueRange.maxVal.toString().length / 3));

    const _areaRange = this.paramsRange.filter((paramRange) => paramRange.fieldName === ParamRangeField.AREA);
    this.areaRange = _areaRange.length ? _areaRange[0] : undefined;
    this.areaRange &&
      (this.areaMaxLength =
        this.areaRange.maxVal.toString().length + Math.ceil(this.areaRange.maxVal.toString().length / 3));
  }

  checkForCurrentCriteriaMessages(criteria: CriteriaContract) {
    this.filterMessageService
      .loadMessages(criteria, this.indicatorType)
      .pipe(take(1))
      .subscribe((messages) => (this.filterMessages = messages));
  }
}
