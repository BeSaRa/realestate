import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from '@components/button/button.component';
import { InputComponent } from '@components/input/input.component';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { InterestRegistration } from '@models/interest-registration';
import { Lookup } from '@models/lookup';
import { InterestRegistrationService } from '@services/interest-registration.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { RECAPTCHA_SETTINGS, RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { catchError, finalize, forkJoin, takeUntil, throwError } from 'rxjs';

@Component({
  selector: 'app-interest-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    MatRadioModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    RecaptchaModule,
  ],
  templateUrl: './interest-registration-page.component.html',
  styleUrl: './interest-registration-page.component.scss',
})
export default class InterestRegistrationPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  @ViewChild('recaptcha') recaptcha!: RecaptchaComponent;

  lang = inject(TranslationService);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  interestRegistrationService = inject(InterestRegistrationService);
  recaptchaSettings = inject(RECAPTCHA_SETTINGS);

  registered = false;

  form = this.fb.group({
    personal: this.fb.group({
      fullName: ['', [CustomValidators.required]],
      passportNo: ['', []],
    }),
    contact: this.fb.group({
      email: ['', [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
      phone: ['', [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
    }),
    category: ['', [CustomValidators.required]],
    questions: this.fb.group({
      isInterestedApartment: ['', [CustomValidators.required]],
      preferedAppartmentType: ['', []],
      area: this.fb.group({
        from: ['', [CustomValidators.number]],
        to: ['', [CustomValidators.number]],
      }),
      price: this.fb.group({
        from: ['', [CustomValidators.number]],
        to: ['', [CustomValidators.number]],
      }),
      hadVisited: ['', [CustomValidators.required]],
      interestedInMovingOrInvesting: ['', [CustomValidators.required]],
      haveMoreQuestions: ['', [CustomValidators.required]],
      exhibitName: ['', [CustomValidators.required]],
    }),
  });

  get personal() {
    return this.form.controls.personal;
  }

  get contact() {
    return this.form.controls.contact;
  }

  get category() {
    return this.form.controls.category;
  }

  get isInterestedApartment() {
    return this.form.controls.questions.controls.isInterestedApartment;
  }

  get preferedAppartmentType() {
    return this.form.controls.questions.controls.preferedAppartmentType;
  }

  get area() {
    return this.form.controls.questions.controls.area;
  }

  get price() {
    return this.form.controls.questions.controls.price;
  }

  get hadVisited() {
    return this.form.controls.questions.controls.hadVisited;
  }

  get interestedInMovingOrInvesting() {
    return this.form.controls.questions.controls.interestedInMovingOrInvesting;
  }

  get haveMoreQuestions() {
    return this.form.controls.questions.controls.haveMoreQuestions;
  }

  get exhibitName() {
    return this.form.controls.questions.controls.exhibitName;
  }

  isSaving = false;
  isRecaptchaVisible = false;
  isRecaptchaResolved = false;
  isWaitingForRecaptchaResolve = false;

  get questions() {
    return this.form.controls.questions;
  }

  categories: Lookup[] = [];
  apartments: Lookup[] = [];
  exhibits: Lookup[] = [];

  ngOnInit(): void {
    this._loadLookups();
    this._listenToIsInterestedApartmentChange();
  }

  private _loadLookups() {
    forkJoin([
      this.interestRegistrationService.loadCategories(),
      this.interestRegistrationService.loadApartments(),
      this.interestRegistrationService.loadExhibits(),
    ]).subscribe(([_categories, _apartments, _exhibits]) => {
      this.categories = _categories;
      this.apartments = _apartments;
      this.exhibits = _exhibits;
    });
  }

  private _listenToIsInterestedApartmentChange() {
    this.isInterestedApartment.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((_isInterested) => {
      if (_isInterested) {
        this.area.addValidators([CustomValidators.compareFromTo('from', 'to') as ValidatorFn]);
        this.price.addValidators([CustomValidators.compareFromTo('from', 'to') as ValidatorFn]);
        this.area.controls.from.addValidators([CustomValidators.required]);
        this.area.controls.to.addValidators([CustomValidators.required]);
        this.price.controls.from.addValidators([CustomValidators.required]);
        this.price.controls.to.addValidators([CustomValidators.required]);
      } else {
        this.area.removeValidators([CustomValidators.compareFromTo('from', 'to') as ValidatorFn]);
        this.price.removeValidators([CustomValidators.compareFromTo('from', 'to') as ValidatorFn]);
        this.area.controls.from.removeValidators([CustomValidators.required]);
        this.area.controls.to.removeValidators([CustomValidators.required]);
        this.price.controls.from.removeValidators([CustomValidators.required]);
        this.price.controls.to.removeValidators([CustomValidators.required]);
      }
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isSaving) return;
    if (!this.isRecaptchaResolved) {
      this.isRecaptchaVisible = true;
      this.isWaitingForRecaptchaResolve = true;
    } else {
      this.register();
    }
  }

  onRecaptchaResolved(token: string) {
    if (!token) return;
    this.isRecaptchaResolved = true;
    this.isWaitingForRecaptchaResolve = false;
    this.register();
  }

  register() {
    this.isSaving = true;
    this.interestRegistrationService
      .saveItem(this._toModel())
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.isRecaptchaResolved = false;
          this.isRecaptchaVisible = false;
          this.recaptcha.reset();
        }),
        catchError((err) => {
          this.toast.error(this.lang.map.an_error_occured_while_saving_interested_data_please_try_again);
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.registered = true;
        this.form.reset();
      });
  }

  registerNew() {
    this.registered = false;
  }

  private _toModel() {
    return new InterestRegistration().clone<InterestRegistration>({
      full_name: this.personal.controls.fullName.value!,
      passport_number: this.personal.controls.passportNo.value!,
      email: this.contact.controls.email.value!,
      phone: this.contact.controls.phone.value!,
      category_id: this.category.value as unknown as number,
      is_interested_in_buying_apartment: this.isInterestedApartment.value as unknown as boolean,
      apartment_type_id: this.preferedAppartmentType.value
        ? (this.preferedAppartmentType.value as unknown as number)
        : null,
      area_from: this.area.controls.from.value as unknown as number,
      area_to: this.area.controls.to.value as unknown as number,
      price_from: this.price.controls.from.value as unknown as number,
      price_to: this.price.controls.to.value as unknown as number,
      visited_qatar_before: this.hadVisited.value as unknown as boolean,
      interested_moving_investing_in_qatar: this.interestedInMovingOrInvesting.value as unknown as boolean,
      need_more_information: this.haveMoreQuestions.value as unknown as boolean,
      exhibit_id: this.exhibitName.value as unknown as number,
    });
  }
}
