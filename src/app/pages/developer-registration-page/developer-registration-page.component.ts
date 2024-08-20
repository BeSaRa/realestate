import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { AppIcons } from '@constants/app-icons';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { takeUntil } from 'rxjs';

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
  ],
  templateUrl: './developer-registration-page.component.html',
  styleUrl: './developer-registration-page.component.scss',
})
export default class DeveloperRegistrationPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  fb = inject(FormBuilder);
  datePipe = inject(DatePipe);

  form = this.fb.group({
    main: this.fb.group({
      companyName: [null, [CustomValidators.required]],
      address: [null, [CustomValidators.required]],
      licenseNo: [null, [CustomValidators.required, CustomValidators.number]],
      licenseDate: [null as string | null, [CustomValidators.required]],
      recordNo: [null, [CustomValidators.required, CustomValidators.number]],
      establishmentNo: [null, [CustomValidators.required, CustomValidators.number]],
      establishmentExpirationDate: [null as string | null, [CustomValidators.required]],
      shareCapital: [null, [CustomValidators.required, CustomValidators.number]],
      employeesNo: [null, [CustomValidators.required, CustomValidators.number]],
      engineersNo: [null, [CustomValidators.required, CustomValidators.number]],
      workersNo: [null, [CustomValidators.required, CustomValidators.number]],
    }),

    contact: this.fb.group({
      chairman: this.fb.group({
        name: [null, [CustomValidators.required]],
        email: [null, [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
        phone: [null, [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
      }),
      ceo: this.fb.group({
        name: [null, [CustomValidators.required]],
        email: [null, [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
        phone: [null, [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
      }),
      relationsCoordinator: this.fb.group({
        name: [null, [CustomValidators.required]],
        email: [null, [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
        phone: [null, [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
      }),
    }),

    insideQatar: this.fb.group({
      implementedProjects: [null, [CustomValidators.required, CustomValidators.number]],
      currentProjects: [null, [CustomValidators.required, CustomValidators.number]],
      futureProjects: [null, [CustomValidators.required, CustomValidators.number]],
      hasOffPlanProjects: [null, [CustomValidators.required]],
      implementedOffPlan: [null, []],
      currentOffPlan: [null, []],
      futureOffPlan: [null, []],
    }),

    soldOffPlan: this.fb.group({
      villasNo: [null, [CustomValidators.required, CustomValidators.number]],
      apartmentsNo: [null, [CustomValidators.required, CustomValidators.number]],
      commercialNo: [null, [CustomValidators.required, CustomValidators.number]],
      otherNo: [null, [CustomValidators.required, CustomValidators.number]],
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
      landsNo: [null, [CustomValidators.required, CustomValidators.number]],
      mortgagedLandsNo: [null, [CustomValidators.required, CustomValidators.number]],
      landsData: this.fb.array<
        FormGroup<{
          titleDeedNo: FormControl<number | null>;
          cadastralNo: FormControl<number | null>;
          isMortgaged: FormControl<boolean | null>;
        }>
      >([]),
    }),
  });

  readonly todayDate: Date = new Date();
  readonly AppIcons = AppIcons;

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
      country: [null as string | null, [CustomValidators.required]],
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
      titleDeedNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
      cadastralNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
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
    console.log(this.form.value);
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
  }
}
