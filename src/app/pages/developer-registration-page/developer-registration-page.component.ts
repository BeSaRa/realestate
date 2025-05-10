import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { AppIcons } from '@constants/app-icons';
import { LangKeysContract } from '@contracts/lang-keys-contract';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Attachment } from '@models/attachment';
import {
  CurrentOffPlanData,
  CurrentProjectAttachments,
  CurrentProjectData,
  DeveloperRegistration,
  LandDetails,
  OutsideProjects,
} from '@models/developer-registration';
import { DeveloperRegistrationService } from '@services/developer-registration.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { RECAPTCHA_SETTINGS, RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { catchError, finalize, merge, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { ViewAttachmentComponent } from '../../popups/view-attachment/view-attachment.component';
import { ControlDirective } from '@directives/control.directive';

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
    MatTooltipModule,
    ControlDirective,
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
  developerRegistrationService = inject(DeveloperRegistrationService);
  recaptchaSettings = inject(RECAPTCHA_SETTINGS);
  dialog = inject(MatDialog);

  registered = false;

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
      futureProjects: ['', [CustomValidators.required, CustomValidators.number]],
      hasOffPlanProjects: [null, [CustomValidators.required]],
      hasCurrentProjects: [null, [CustomValidators.required]],
      currentProjects: [
        '' as unknown as number,
        [CustomValidators.required, CustomValidators.number, CustomValidators.minValue(1)],
      ],
      implementedOffPlan: ['', []],
      currentOffPlan: ['', []],
      futureOffPlan: ['', []],
      villasNo: ['', []],
      apartmentsNo: ['', []],
      commercialNo: ['', []],
      otherNo: ['', []],

      currentProjectsData: this.fb.array<
        FormGroup<{
          projectName: FormControl<string | null>;
        }>
      >([]),

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

  currentUploader: keyof Omit<CurrentProjectAttachments, 'clone'> = 'license';
  currentUploaderProjectNo = 0;
  currentCollapsed: boolean[] = [];

  offplanCollapsed: boolean[] = [];

  readonly maxProjects = 20;
  readonly maxFilesSize = 50; // MB

  /********* static folders ids  *********/
  attachmentsFoldersMap: Record<keyof Omit<CurrentProjectAttachments, 'clone'>, string> = {
    license: '573403C9-7D05-453F-8E89-1D49E0799195',
    licensePlans: '096E3312-2A9A-46F9-ACF1-EBE06338F117',
    units: 'C7956852-D614-474E-9254-1FD5C88D37D0',
    technicalReport: '69FAB1D4-BCC6-41CA-B8C3-4ECB21EE4854',
    financialReport: 'FDB7387F-C733-4FFA-93C4-E181D8FA5ED4',
    warrantyAgreement: '48052007-5D09-46B6-8956-F2B91F549603',
    saleContracts: 'FB67F7BF-9E8B-4635-8A91-74E7EAA91AC0',
    sampleSaleContracts: '4E77D823-9A5C-4C56-8736-DDA975172540',
  };

  attachmentsLabelsMap: Record<keyof Omit<CurrentProjectAttachments, 'clone'>, keyof LangKeysContract> = {
    license: 'building_license_attachments',
    licensePlans: 'license_file_and_plans_attachments',
    units: 'project_real_estate_units_attachments',
    technicalReport: 'technical_report_from_the_project_consultant_attachments',
    financialReport: 'financial_report_attachments',
    warrantyAgreement: 'a_copy_of_the_escrow_account_agreement',
    saleContracts: 'a_copy_of_the_concluded_sales_contracts',
    sampleSaleContracts: 'models_of_sales_contracts_concluded_with_beneficiaries',
  };

  currentProjectsAttachments: CurrentProjectAttachments[] = [];
  private _attachmentsSize = signal(0);
  attachmentsSize = computed(() => this._attachmentsSize() / (1024 * 1024));

  isSaving = false;
  isRecaptchaVisible = false;
  isRecaptchaResolved = false;
  isWaitingForRecaptchaResolve = false;

  get uploadersTypes() {
    return Object.keys(this.attachmentsLabelsMap) as unknown as (keyof Omit<CurrentProjectAttachments, 'clone'>)[];
  }

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

  get hasCurrentProjects() {
    return this.form.controls.insideQatar.controls.hasCurrentProjects;
  }

  get currentProjects() {
    return this.form.controls.insideQatar.controls.currentProjects;
  }

  get currentProjectsData() {
    return this.form.controls.insideQatar.controls.currentProjectsData;
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
    this.listenToHasProjectsOutsideQatarChange();
    this.listenToHasCurrentChange();
    this.listenToCurrentProjectsChange();
    this.listenToHasOffPlanChange();
    this.listenToOffPlanChange();
  }

  listenToHasProjectsOutsideQatarChange() {
    this.hasProjectsOutsideQatar.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((v) => {
      if (!v) this.outsideProjects.clear({ emitEvent: false });
    });
  }

  listenToHasCurrentChange() {
    this.hasCurrentProjects.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((v) => {
      if (v) this.currentProjects.addValidators([CustomValidators.required, CustomValidators.number]);
      else this.currentProjects.removeValidators([CustomValidators.required, CustomValidators.number]);
      this.currentProjects.updateValueAndValidity({ emitEvent: false });
    });
  }

  listenToCurrentProjectsChange() {
    merge(this.hasCurrentProjects.valueChanges, this.currentProjects.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentProjectsData.clear();
        this.currentProjectsAttachments = [];
        this.currentCollapsed = [];
        if (this.hasCurrentProjects.value && this.currentProjects.value) this.addCurrentProjects();
      });
  }

  addCurrentProjects() {
    for (let i = 0; i < Math.min(this.currentProjects.value as unknown as number, this.maxProjects); i++) {
      this.currentCollapsed.push(true);
      this.currentProjectsData.push(
        this.fb.group({
          projectName: ['' as string | null, [CustomValidators.required]],
        })
      );
      this.currentProjectsAttachments.push(new CurrentProjectAttachments());
    }
    this.currentCollapsed[0] = false;
  }

  openUploader(uploader: HTMLInputElement, projectNo: number, type: keyof Omit<CurrentProjectAttachments, 'clone'>) {
    uploader.click();
    this.currentUploader = type;
    this.currentUploaderProjectNo = projectNo;
  }

  attachmentUploaderChange(uploader: HTMLInputElement) {
    if (
      this.currentUploaderProjectNo >= this.currentProjectsAttachments.length ||
      uploader.files === null ||
      uploader.files.length === 0
    )
      return;
    const files = structuredClone(uploader.files);
    uploader.value = '';
    for (const index in files) {
      if (isNaN(Number(index))) {
        continue;
      }

      this.currentProjectsAttachments[this.currentUploaderProjectNo][this.currentUploader].push(
        new Attachment(true).clone<Attachment>({
          folder: this.attachmentsFoldersMap[this.currentUploader],
          title: files[index].name,
          file: files[index],
        })
      );
      this.updateAttachmentsSize();
    }
  }

  getAttachments(projectNo: number, type: keyof Omit<CurrentProjectAttachments, 'clone'>) {
    if (projectNo >= this.currentProjectsAttachments.length) return [];
    return this.currentProjectsAttachments[projectNo][type];
  }

  getAttachmentIconUrl(attachmentName: string) {
    const extension = attachmentName.slice(attachmentName.lastIndexOf('.') + 1);
    return extension === 'png'
      ? 'assets/icons/png.svg'
      : extension === 'pdf'
      ? 'assets/icons/pdf.svg'
      : 'assets/icons/jpg.svg';
  }

  viewAttachment(attachment: Attachment) {
    this.dialog
      .open(ViewAttachmentComponent, {
        direction: this.lang.isLtr ? 'ltr' : 'rtl',
        data: {
          model: attachment,
        },
      })
      .afterClosed()
      .subscribe();
  }

  deleteAttachment(projectNo: number, type: keyof Omit<CurrentProjectAttachments, 'clone'>, attachment: Attachment) {
    if (
      this.currentProjectsAttachments[projectNo][type] &&
      this.currentProjectsAttachments[projectNo][type].find((att) => att.id === attachment.id)
    ) {
      const _attachmentIndex = this.currentProjectsAttachments[projectNo][type].findIndex(
        (att) => att.id === attachment.id
      );
      this.currentProjectsAttachments[projectNo][type] = [
        ...this.currentProjectsAttachments[projectNo][type].slice(0, _attachmentIndex),
        ...this.currentProjectsAttachments[projectNo][type].slice(_attachmentIndex + 1),
      ];
      this.updateAttachmentsSize();
    }
  }

  updateAttachmentsSize() {
    let _size = 0;
    for (let i = 0; i < this.currentProjectsAttachments.length; i++) {
      Object.keys(this.currentProjectsAttachments[i]).forEach((type) => {
        for (
          let j = 0;
          j < this.currentProjectsAttachments[i][type as keyof Omit<CurrentProjectAttachments, 'clone'>].length;
          j++
        ) {
          _size +=
            this.currentProjectsAttachments[i][type as keyof Omit<CurrentProjectAttachments, 'clone'>][j].file.size;
        }
      });
    }
    this._attachmentsSize.set(_size);
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
        this.offplanCollapsed = [];
        this.currentOffPlanData.clear();
        if (this.hasOffPlanProjects.value && this.currentOffPlan.value) this.addCurrentOffPlanProjects();
      });
  }

  addCurrentOffPlanProjects() {
    for (let i = 0; i < (this.currentOffPlan.value as unknown as number); i++) {
      this.offplanCollapsed.push(true);
      this.currentOffPlanData.push(
        this.fb.group({
          projectName: ['' as string | null, [CustomValidators.required]],
          buildingLicenseNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
          projectStartDate: ['' as string | null, [CustomValidators.required]],
          projectExpectedEndDate: ['' as string | null, [CustomValidators.required]],
          projectCompletionPercentage: [
            null as number | null,
            [CustomValidators.required, CustomValidators.number, CustomValidators.maxValue(100)],
          ],
          villasNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
          apartmentsNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
          commercialNo: [null as number | null, [CustomValidators.required, CustomValidators.number]],
          otherNo: [null as number | null, [CustomValidators.number]],
        })
      );
    }
    this.offplanCollapsed[0] = false;
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
    this.licenseDate.patchValue(this.licenseDate.value ? this._transformDate(this.licenseDate.value) : '', {
      emitEvent: false,
    });
  }

  onEstablishmentExpirationDateChange() {
    this.establishmentExpirationDate.patchValue(
      this.establishmentExpirationDate.value ? this._transformDate(this.establishmentExpirationDate.value) : '',
      { emitEvent: false }
    );
  }

  onCurrentProjectStartDateChange(projectIndex: number) {
    const _control = this.currentOffPlanData.at(projectIndex).controls.projectStartDate;
    _control.patchValue(_control.value ? this._transformDate(_control.value) : '', {
      emitEvent: false,
    });
  }

  onCurrentProjectExpectedEndDateChange(projectIndex: number) {
    const _control = this.currentOffPlanData.at(projectIndex).controls.projectExpectedEndDate;
    _control.patchValue(_control.value ? this._transformDate(_control.value) : '', {
      emitEvent: false,
    });
  }

  onSubmit() {
    if (!this.form.valid || this.attachmentsSize() > this.maxFilesSize) {
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
      .uploadFiles(this.currentProjectsAttachments)
      .pipe(
        tap((res) => {
          if (res) {
            res.forEach((attachment) => {
              const [p, type, i] = attachment.description.split('---');
              const projectNo = parseInt(p);
              const idx = parseInt(i);
              this.currentProjectsAttachments[projectNo - 1][type as keyof Omit<CurrentProjectAttachments, 'clone'>][
                idx - 1
              ].id = attachment.id;
            });
          }
        })
      )
      .pipe(switchMap(() => this.developerRegistrationService.saveItem(this._toModel())))
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
        this.registered = true;
        this.form.reset();
      });
  }

  registerNew() {
    this.registered = false;
  }

  private _toModel() {
    const _currentProjectsData = this.currentProjectsData.value.map((v, i) =>
      new CurrentProjectData().clone<CurrentProjectData>({
        projectName: v.projectName as string,
        licenseAttachments: this.currentProjectsAttachments[i + 1]['license'].map((a) => a.id),
        licensePlansAttachments: this.currentProjectsAttachments[i + 1]['licensePlans'].map((a) => a.id),
        unitsAttachments: this.currentProjectsAttachments[i + 1]['units'].map((a) => a.id),
        technicalReportAttachments: this.currentProjectsAttachments[i + 1]['technicalReport'].map((a) => a.id),
        financialReportAttachments: this.currentProjectsAttachments[i + 1]['financialReport'].map((a) => a.id),
        warrantyAgreementAttachments: this.currentProjectsAttachments[i + 1]['warrantyAgreement'].map((a) => a.id),
        saleContractsAttachments: this.currentProjectsAttachments[i + 1]['saleContracts'].map((a) => a.id),
        sampleSaleContractsAttachments: this.currentProjectsAttachments[i + 1]['sampleSaleContracts'].map((a) => a.id),
      })
    );

    const _currentOffPlanData = this.currentOffPlanData.value.map((v) =>
      new CurrentOffPlanData().clone<CurrentOffPlanData>({
        projectName: v.projectName as string,
        buildingLicenseNo: v.buildingLicenseNo as unknown as number,
        projectStartDate: v.projectStartDate as string,
        projectExpectedEndDate: v.projectExpectedEndDate as string,
        projectCompletionPercentage: v.projectCompletionPercentage as unknown as number,
        villasNo: v.villasNo as unknown as number,
        apartmentsNo: v.apartmentsNo as unknown as number,
        commercialNo: v.commercialNo as unknown as number,
        otherNo: v.otherNo as unknown as number,
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
      hasCurrentProjects: this.insideProjects.value.hasCurrentProjects as unknown as boolean,
      currentProjects: this.insideProjects.value.currentProjects as unknown as number,
      currentProjectData: _currentProjectsData,
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

  testUpload() {
    this.developerRegistrationService.uploadFiles(this.currentProjectsAttachments).subscribe((res) => console.log(res));
  }

  private _transformDate(date: any) {
    return this.datePipe.transform(date, 'yyyy-MM-dd', undefined);
  }
}
