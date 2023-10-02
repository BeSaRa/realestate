import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
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
import { PriceCriteriaContract } from '@contracts/price-criteria-contract';
import { ControlDirective } from '@directives/control.directive';
import { InputPrefixDirective } from '@directives/input-prefix.directive';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { CriteriaType } from '@enums/criteria-type';
import { Durations } from '@enums/durations';
import { HalfYearDurations } from '@enums/half-year-durations';
import { ParamRangeField } from '@enums/param-range-field';
import { Lookup } from '@models/lookup';
import { ParamRange } from '@models/param-range';
import { LookupService } from '@services/lookup.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { range } from '@utils/utils';
import { CustomValidators } from '@validators/custom-validators';
import { NgResizeObserver, ngResizeObserverProviders } from 'ng-resize-observer';
import { NgxMaskDirective } from 'ngx-mask';
import { Subject, debounceTime, filter, map, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-base-filter',
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
  providers: [DatePipe, ...ngResizeObserverProviders],
  templateUrl: './base-filter.component.html',
  styleUrls: ['./base-filter.component.scss'],
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
export class BaseFilterComponent implements OnInit, OnDestroy {
  @Input() priceMunicipalities: Lookup[] = [];
  @Input() pricePropertyTypes: Lookup[] = [];
  @Input() priceAreas: Lookup[] = [];

  @Output() fromChanged = new EventEmitter<PriceCriteriaContract>();

  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  lookupService = inject(LookupService);
  resize$ = inject(NgResizeObserver);

  private destroy$: Subject<void> = new Subject();

  filteredAreas: Lookup[] = [];


  priceForm = this.fb.group(
    {
      areaCode: [],
      municipalityId: [],
      propertyTypeList: []
    },
  );

  protected readonly AppIcons = AppIcons;

  get municipalityId(): AbstractControl {
    return this.priceForm.get('municipalityId') as AbstractControl;
  }

  get areaCode(): AbstractControl {
    return this.priceForm.get('areaCode') as AbstractControl;
  }

  get propertyTypeList(): AbstractControl {
    return this.priceForm.get('propertyTypeList') as AbstractControl;
  }

  ngOnInit(): void {
    this.listenToMunicipalityChange();
    // this.listenToPropertyTypeListChange();
    this.listenToFormChanges();
    this.setDefaultValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private setDefaultValues() {
    this.priceForm.patchValue({
      municipalityId: 4,
      propertyTypeList: 1,
      areaCode: 4
    });
    this.sendFilter();
  }

  listenToMunicipalityChange(): void {
    this.municipalityId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number) => {
        this.filteredAreas = this.priceAreas.filter((item) => item.municipalityId === value);
        this.areaCode.setValue(this.filteredAreas.at(0)?.lookupKey);
        // this.propertyTypeList.setValue(this.propertyTypes[0])
    });
  }

  listenToPropertyTypeListChange(): void {
    this.propertyTypeList.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: number) => {
      this.propertyTypeList.patchValue(value, {
        emitEvent: false,
      });
    });
  }

  resetForm(): void {
    this.priceForm.reset({}, { emitEvent: false });
    this.setDefaultValues();
  }

  sendFilter(): void {
    let value = { ...this.priceForm.value, propertyTypeList : [this.priceForm.value.propertyTypeList]};
    this.fromChanged.emit(value as PriceCriteriaContract);
  }

  private listenToFormChanges() {
    this.priceForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(250),
        filter(() => this.priceForm.valid)
      )
      .subscribe(() => {
        this.sendFilter();
      });
  }

}
