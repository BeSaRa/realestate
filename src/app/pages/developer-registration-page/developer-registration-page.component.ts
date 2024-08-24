import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { AppIcons } from '@constants/app-icons';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { DeveloperRegistration, LandDetails, OutsideProjects } from '@models/developer-registration';
import { DeveloperRegistrationService } from '@services/developer-registration.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { catchError, finalize, takeUntil, throwError } from 'rxjs';

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
  ],
  templateUrl: './developer-registration-page.component.html',
  styleUrl: './developer-registration-page.component.scss',
})
export default class DeveloperRegistrationPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  fb = inject(FormBuilder);
  datePipe = inject(DatePipe);
  toast = inject(ToastService);
  developerRegistrationService = inject(DeveloperRegistrationService);

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
    }),

    soldOffPlan: this.fb.group({
      villasNo: ['', [CustomValidators.required, CustomValidators.number]],
      apartmentsNo: ['', [CustomValidators.required, CustomValidators.number]],
      commercialNo: ['', [CustomValidators.required, CustomValidators.number]],
      otherNo: ['', [CustomValidators.required, CustomValidators.number]],
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
      landsNo: ['', [CustomValidators.required, CustomValidators.number]],
      mortgagedLandsNo: ['', [CustomValidators.required, CustomValidators.number]],
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

  get main() {
    return this.form.controls.main;
  }

  get contact() {
    return this.form.controls.contact;
  }

  get insideProjects() {
    return this.form.controls.insideQatar;
  }

  get soldOffPlan() {
    return this.form.controls.soldOffPlan;
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
    ];
  }

  get hasProjectsOutsideQatar() {
    return this.form.controls.outsideQatar.controls.hasProjectsOutsideQatar;
  }

  ngOnInit(): void {
    this.listenToHasProjectsOutsideQatarChange();
    this.listenToHasOffPlanChange();
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

  changeLang(event: Event) {
    event.preventDefault();
    this.lang.toggleLang();
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

  register() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isSaving) return;

    this.isSaving = true;
    this.developerRegistrationService
      .saveItem(this._toModel())
      .pipe(
        finalize(() => (this.isSaving = false)),
        catchError((err) => {
          this.toast.error(this.lang.map.an_error_occured_while_saving_developer_data_please_try_again);
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.developer_data_saved_successfully);
        this.outsideProjects.clear();
        this.lands.clear();
        this.form.reset();
      });
  }

  private _toModel() {
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
      futureOffPlan: this.insideProjects.value.futureOffPlan as unknown as number,

      soldVillasNo: this.soldOffPlan.value.villasNo as unknown as number,
      soldApartmentsNo: this.soldOffPlan.value.apartmentsNo as unknown as number,
      soldCommercialNo: this.soldOffPlan.value.commercialNo as unknown as number,
      otherNo: this.soldOffPlan.value.otherNo as unknown as number,

      hasProjectsOutsideQatar: this.hasProjectsOutsideQatar.value as unknown as boolean,
      outside_projects: _outsideProjects,

      landsNo: this.form.controls.lands.value.landsNo as unknown as number,
      mortgagedLandsNo: this.form.controls.lands.value.mortgagedLandsNo as unknown as number,
      lands: _lands,
    });
  }
}
