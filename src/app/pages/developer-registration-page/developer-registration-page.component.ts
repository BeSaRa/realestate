import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { AppIcons } from '@constants/app-icons';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import {
  CurrentOffPlanData,
  DeveloperRegistration,
  LandDetails,
  OutsideProjects,
} from '@models/developer-registration';
import { DeveloperRegistrationService } from '@services/developer-registration.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { RECAPTCHA_SETTINGS, RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { catchError, finalize, merge, takeUntil, throwError } from 'rxjs';

@Component({
  selector: 'app-developer-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    MatRadioModule,
    IconButtonComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RecaptchaModule,
    CustomTooltipDirective,
  ],
  templateUrl: './developer-registration-page.component.html',
  styleUrl: './developer-registration-page.component.scss',
})
export default class DeveloperRegistrationPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  @ViewChild('recaptcha') recaptcha!: RecaptchaComponent;

  lang = inject(TranslationService);
  fb = inject(FormBuilder);
  datePipe = inject(DatePipe);
  toast = inject(ToastService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  developerRegistrationService = inject(DeveloperRegistrationService);
  recaptchaSettings = inject(RECAPTCHA_SETTINGS);

  form = this.fb.group({
    main: this.fb.group({
      companyName: ['', [CustomValidators.required]],
      address: ['', [CustomValidators.required]],
      licenseNo: ['', [CustomValidators.required, CustomValidators.number]],
      licenseDate: ['', [CustomValidators.required]],
      recordNo: ['', [CustomValidators.required, CustomValidators.number]],
      establishmentNo: ['', [CustomValidators.required, CustomValidators.number]],
      establishmentExpirationDate: ['', [CustomValidators.required]],
      shareCapital: ['', [CustomValidators.required, CustomValidators.number]],
      employeesNo: ['', [CustomValidators.required, CustomValidators.number]],
      engineersNo: ['', [CustomValidators.required, CustomValidators.number]],
      workersNo: ['', [CustomValidators.required, CustomValidators.number]],
    }),

    contact: this.fb.group({
      chairman: this.fb.group({
        name: ['', [CustomValidators.required]],
        email: ['', [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
        phone: ['', [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
      }),
      ceo: this.fb.group({
        name: ['', [CustomValidators.required]],
        email: ['', [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
        phone: ['', [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
      }),
      relationsCoordinator: this.fb.group({
        name: ['', [CustomValidators.required]],
        email: ['', [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
        phone: ['', [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
      }),
    }),

    insideQatar: this.fb.group({
      implementedProjects: ['', [CustomValidators.required, CustomValidators.number]],
      currentProjects: ['', [CustomValidators.required, CustomValidators.number]],
      futureProjects: ['', [CustomValidators.required, CustomValidators.number]],
      hasOffPlanProjects: [null, [CustomValidators.required]],
      implementedOffPlan: ['', []],
      currentOffPlan: ['', []],
      futureOffPlan: ['', []],
      villasNo: ['', []],
      apartmentsNo: ['', []],
      commercialNo: ['', []],
      otherNo: ['', []],

      currentOffPlanData: this.fb.array<
        FormGroup<{
          projectName: FormControl<string | null>;
          buildingLicenseNo: FormControl<number | null>;
          projectStartDate: FormControl<string | null>;
          projectExpectedEndDate: FormControl<string | null>;
          projectCompletionPercentage: FormControl<number | null>;
          villasNo: FormControl<number | null>;
          apartmentsNo: FormControl<number | null>;
          commercialNo: FormControl<number | null>;
          otherNo: FormControl<number | null>;
        }>
      >([]),
    }),

    outsideQatar: this.fb.group({
      hasProjectsOutsideQatar: [null, [CustomValidators.required]],
      projectsOutsideQatar: this.fb.array<
        FormGroup<{
          country: FormControl<string | null>;
          implementedProjects: FormControl<number | null>;
          currentProjects: FormControl<number | null>;
          futureProjects: FormControl<number | null>;
          implementedOffPlan: FormControl<number | null>;
          currentOffPlan: FormControl<number | null>;
          futureOffPlan: FormControl<number | null>;
        }>
      >([]),
    }),

    lands: this.fb.group({
      // landsNo: ['', [CustomValidators.required, CustomValidators.number]],
      // mortgagedLandsNo: ['', [CustomValidators.required, CustomValidators.number]],
      landsData: this.fb.array<
        FormGroup<{
          titleDeedNo: FormControl<string | null>;
          cadastralNo: FormControl<string | null>;
          isMortgaged: FormControl<boolean | null>;
        }>
      >([]),
    }),
  });

  readonly todayDate: Date = new Date();
  readonly AppIcons = AppIcons;

  isSaving = false;
  isRecaptchaVisible = false;
  isRecaptchaResolved = false;
  isWaitingForRecaptchaResolve = false;

  get main() {
    return this.form.controls.main;
  }

  get contact() {
    return this.form.controls.contact;
  }

  get insideProjects() {
    return this.form.controls.insideQatar;
  }

  get currentOffPlan() {
    return this.form.controls.insideQatar.controls.currentOffPlan;
  }

  get implementedOffPlan() {
    return this.form.controls.insideQatar.controls.implementedOffPlan;
  }

  get futureOffPlan() {
    return this.form.controls.insideQatar.controls.futureOffPlan;
  }

  get currentOffPlanData() {
    return this.form.controls.insideQatar.controls.currentOffPlanData;
  }

  get outsideProjects() {
    return this.form.controls.outsideQatar.controls.projectsOutsideQatar;
  }

  get lands() {
    return this.form.controls.lands.controls.landsData;
  }

  get licenseDate() {
    return this.form.controls.main.controls.licenseDate;
  }

  get establishmentExpirationDate() {
    return this.form.controls.main.controls.establishmentExpirationDate;
  }

  get hasOffPlanProjects() {
    return this.form.controls.insideQatar.controls.hasOffPlanProjects;
  }

  get allOffPlanProjects() {
    return [
      this.form.controls.insideQatar.controls.implementedOffPlan,
      this.form.controls.insideQatar.controls.currentOffPlan,
      this.form.controls.insideQatar.controls.futureOffPlan,
      this.form.controls.insideQatar.controls.apartmentsNo,
      this.form.controls.insideQatar.controls.commercialNo,
      this.form.controls.insideQatar.controls.villasNo,
    ];
  }

  get hasProjectsOutsideQatar() {
    return this.form.controls.outsideQatar.controls.hasProjectsOutsideQatar;
  }

  ngOnInit(): void {
    this.form.controls.insideQatar.addValidators([
      (group: AbstractControl) => {
        return (group as FormGroup).controls['hasOffPlanProjects'].value &&
          (group as FormGroup).controls['currentOffPlan'].value &&
          (group as FormGroup).controls['currentOffPlan'].value !==
            ((group as FormGroup).controls['currentOffPlanData'] as FormArray).length
          ? { error: 'CURRENT_OFF_PLAN_ERROR' }
          : null;
      },
    ]);

    this.listenToHasProjectsOutsideQatarChange();
    this.listenToHasOffPlanChange();
    this.listenToOffPlanChange();
  }

  listenToHasProjectsOutsideQatarChange() {
    this.hasProjectsOutsideQatar.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((v) => {
      if (!v) this.outsideProjects.clear({ emitEvent: false });
    });
  }

  listenToHasOffPlanChange() {
    this.hasOffPlanProjects.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((v) => {
      this.allOffPlanProjects.forEach((c) => {
        if (v) c.addValidators([CustomValidators.required, CustomValidators.number]);
        else c.removeValidators([CustomValidators.required, CustomValidators.number]);
        c.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  listenToOffPlanChange() {
    merge(this.hasOffPlanProjects.valueChanges, this.currentOffPlan.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.hasOffPlanProjects.value || !this.currentOffPlan.value) this.currentOffPlanData.clear();
      });
  }

  canAddOffPlanProjectsData() {
    return (
      this.currentOffPlan.value && (this.currentOffPlan.value as unknown as number) > this.currentOffPlanData.length
    );
  }

  hasCorrectCountOfOffplanCurrentProjects() {
    return (this.currentOffPlan.value as unknown as number) === this.currentOffPlanData.length;
  }

  addCurrentOffPlanProjects() {
    const group = this.fb.group({
      projectName: ['' as string | null, [CustomValidators.required]],
      buildingLicenseNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      projectStartDate: ['' as string | null, [CustomValidators.required]],
      projectExpectedEndDate: ['' as string | null, [CustomValidators.required]],
      projectCompletionPercentage: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      villasNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      apartmentsNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      commercialNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      otherNo: [null as number | null, [CustomValidators.number]],
    });

    this.currentOffPlanData.push(group);
  }

  deleteCurrentProjects(index: number) {
    this.currentOffPlanData.removeAt(index);
  }

  addOutsideProjects() {
    const group = this.fb.group({
      country: ['' as string | null, [CustomValidators.required]],
      implementedProjects: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      currentProjects: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      futureProjects: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      implementedOffPlan: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      currentOffPlan: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      futureOffPlan: [null as number | null, [CustomValidators.required, CustomValidators.number]],
    });

    this.outsideProjects.push(group);
  }

  deleteOutsideProjects(index: number) {
    this.outsideProjects.removeAt(index);
  }

  addlandData() {
    const group = this.fb.group({
      titleDeedNo: ['' as string | null, [CustomValidators.required, CustomValidators.number]],
      cadastralNo: ['' as string | null, [CustomValidators.required, CustomValidators.number]],
      isMortgaged: [null as boolean | null, [CustomValidators.required]],
    });

    this.lands.push(group);
  }

  deleteLandData(index: number) {
    this.lands.removeAt(index);
  }

  onLicenseDateChange() {
    this.licenseDate.patchValue(
      this.licenseDate.value ? this.datePipe.transform(this.licenseDate.value, 'YYY-MM-dd') : '',
      { emitEvent: false }
    );
  }

  onEstablishmentExpirationDateChange() {
    this.establishmentExpirationDate.patchValue(
      this.establishmentExpirationDate.value
        ? this.datePipe.transform(this.establishmentExpirationDate.value, 'YYY-MM-dd')
        : '',
      { emitEvent: false }
    );
  }

  onCurrentProjectStartDateChange(projectIndex: number) {
    const _control = this.currentOffPlanData.at(projectIndex).controls.projectStartDate;
    _control.patchValue(_control.value ? this.datePipe.transform(_control.value, 'YYY-MM-dd') : '', {
      emitEvent: false,
    });
  }

  onCurrentProjectExpectedEndDateChange(projectIndex: number) {
    const _control = this.currentOffPlanData.at(projectIndex).controls.projectExpectedEndDate;
    _control.patchValue(_control.value ? this.datePipe.transform(_control.value, 'YYY-MM-dd') : '', {
      emitEvent: false,
    });
  }

  onSubmit() {
    console.log(this.form.value);
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
    this.developerRegistrationService
      .saveItem(this._toModel())
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.isRecaptchaResolved = false;
          this.isRecaptchaVisible = false;
          this.recaptcha.reset();
        }),
        catchError((err) => {
          this.toast.error(this.lang.map.an_error_occured_while_saving_developer_data_please_try_again);
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.router.navigate(['../developer-registration-success'], { relativeTo: this.route });
      });
  }

  private _toModel() {
    const _currentOffPlanData = this.currentOffPlanData.value.map((v) =>
      new CurrentOffPlanData().clone<CurrentOffPlanData>({
        projectName: v.projectName as string,
        buildingLicenseNo: v.buildingLicenseNo as unknown as number,
        projectStartDate: v.projectStartDate as string,
        projectExpectedEndDate: v.projectExpectedEndDate as string,
        projectCompletionPercentage: v.projectCompletionPercentage as unknown as number,
        villasNo: v.projectCompletionPercentage as unknown as number,
        apartmentsNo: v.projectCompletionPercentage as unknown as number,
        commercialNo: v.projectCompletionPercentage as unknown as number,
        otherNo: v.projectCompletionPercentage as unknown as number,
      })
    );

    const _outsideProjects = this.outsideProjects.value.map((v) =>
      new OutsideProjects().clone<OutsideProjects>({
        country: v.country as string,
        implementedProjects: v.implementedProjects as unknown as number,
        currentProjects: v.currentProjects as unknown as number,
        futureProjects: v.futureProjects as unknown as number,
        implementedOffPlan: v.implementedOffPlan as unknown as number,
        currentOffPlan: v.currentOffPlan as unknown as number,
        futureOffPlan: v.futureOffPlan as unknown as number,
      })
    );

    const _lands = this.lands.value.map((v) =>
      new LandDetails().clone<LandDetails>({
        titleDeedNo: v.titleDeedNo as string,
        cadastralNo: v.cadastralNo as string,
        isMortgaged: v.isMortgaged as unknown as boolean,
      })
    );

    return new DeveloperRegistration().clone<DeveloperRegistration>({
      companyName: this.main.value.companyName as string,
      address: this.main.value.address as string,
      licenseNo: this.main.value.licenseNo as string,
      licenseDate: this.main.value.licenseDate as string,
      recordNo: this.main.value.recordNo as string,
      establishmentNo: this.main.value.establishmentNo as string,
      establishmentExpirationDate: this.main.value.establishmentExpirationDate as string,
      shareCapital: this.main.value.shareCapital as unknown as number,
      employeesNo: this.main.value.employeesNo as unknown as number,
      engineersNo: this.main.value.engineersNo as unknown as number,
      workersNo: this.main.value.workersNo as unknown as number,

      ch_name: this.contact.value.chairman?.name as string,
      ch_email: this.contact.value.chairman?.email as string,
      ch_phone: this.contact.value.chairman?.phone as string,
      ce_name: this.contact.value.ceo?.name as string,
      ce_email: this.contact.value.ceo?.email as string,
      ce_phone: this.contact.value.ceo?.phone as string,
      re_name: this.contact.value.relationsCoordinator?.name as string,
      re_email: this.contact.value.relationsCoordinator?.email as string,
      re_phone: this.contact.value.relationsCoordinator?.phone as string,

      implementedProjects: this.insideProjects.value.implementedProjects as unknown as number,
      currentProjects: this.insideProjects.value.currentProjects as unknown as number,
      futureProjects: this.insideProjects.value.futureProjects as unknown as number,
      hasOffPlanProjects: this.insideProjects.value.hasOffPlanProjects as unknown as boolean,
      implementedOffPlan: this.insideProjects.value.implementedOffPlan as unknown as number,
      currentOffPlan: this.insideProjects.value.currentOffPlan as unknown as number,
      currentOffPlanData: _currentOffPlanData,
      futureOffPlan: this.insideProjects.value.futureOffPlan as unknown as number,

      soldVillasNo: this.insideProjects.value.villasNo as unknown as number,
      soldApartmentsNo: this.insideProjects.value.apartmentsNo as unknown as number,
      soldCommercialNo: this.insideProjects.value.commercialNo as unknown as number,
      otherNo: this.insideProjects.value.otherNo as unknown as number,

      hasProjectsOutsideQatar: this.hasProjectsOutsideQatar.value as unknown as boolean,
      outside_projects: _outsideProjects,

      // landsNo: this.form.controls.lands.value.landsNo as unknown as number,
      // mortgagedLandsNo: this.form.controls.lands.value.mortgagedLandsNo as unknown as number,
      // lands: _lands,
    });
  }
}
