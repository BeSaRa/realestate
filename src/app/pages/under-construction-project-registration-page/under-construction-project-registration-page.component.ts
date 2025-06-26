import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { AppIcons } from '@constants/app-icons';
import { LangKeysContract } from '@contracts/lang-keys-contract';
import { Attachment } from '@models/attachment';
import { CurrentProjectAttachments, CurrentProjectData } from '@models/developer-registration';
import { ConfigService } from '@services/config.service';
import { DeveloperRegistrationService } from '@services/developer-registration.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { RECAPTCHA_SETTINGS, RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { catchError, filter, finalize, map, switchMap, tap, throwError } from 'rxjs';
import { ViewAttachmentComponent } from 'src/app/popups/view-attachment/view-attachment.component';

@Component({
  selector: 'app-under-construction-project-registration-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    MatIconModule,
    MatDatepickerModule,
    IconButtonComponent,
    MatTooltipModule,
    RecaptchaModule,
    ButtonComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './under-construction-project-registration-page.component.html',
  styleUrl: './under-construction-project-registration-page.component.scss',
})
export default class UnderConstructionProjectRegistrationPageComponent {
  @ViewChild('recaptcha') recaptcha!: RecaptchaComponent;

  lang = inject(TranslationService);
  fb = inject(FormBuilder);
  datePipe = inject(DatePipe);
  config = inject(ConfigService);
  dialog = inject(MatDialog);
  developerRegistrationService = inject(DeveloperRegistrationService);
  toast = inject(ToastService);
  recaptchaSettings = inject(RECAPTCHA_SETTINGS);

  registered = false;

  readonly todayDate: Date = new Date();
  readonly AppIcons = AppIcons;

  form = this.fb.group({
    developerName: ['', CustomValidators.required],
    projectName: ['', CustomValidators.required],
    location: ['', CustomValidators.required],
    startDate: ['', CustomValidators.required],
    endDate: ['', CustomValidators.required],
  });

  get startDate() {
    return this.form.controls.startDate;
  }
  get endDate() {
    return this.form.controls.endDate;
  }

  isSaving = false;
  isRecaptchaVisible = false;
  isRecaptchaResolved = false;
  isWaitingForRecaptchaResolve = false;

  projectAttachments = new CurrentProjectAttachments();
  currentUploader: keyof Omit<CurrentProjectAttachments, 'clone'> = 'license';
  private _attachmentsSize = signal(0);
  attachmentsSize = computed(() => this._attachmentsSize() / (1024 * 1024));

  readonly maxProjects = 20;
  readonly maxFilesSize = this.config.CONFIG.MAX_FILES_SIZE_IN_MB; // MB
  readonly allowedFiles = '(pdf - png - jpeg - jpg)';

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

  get uploadersTypes() {
    return Object.keys(this.attachmentsLabelsMap) as unknown as (keyof Omit<CurrentProjectAttachments, 'clone'>)[];
  }

  openUploader(uploader: HTMLInputElement, type: keyof Omit<CurrentProjectAttachments, 'clone'>) {
    uploader.click();
    this.currentUploader = type;
  }

  attachmentUploaderChange(uploader: HTMLInputElement) {
    if (uploader.files === null || uploader.files.length === 0) return;
    const files = structuredClone(uploader.files);
    uploader.value = '';
    for (const index in files) {
      if (isNaN(Number(index))) {
        continue;
      }

      this.projectAttachments[this.currentUploader].push(
        new Attachment(true).clone<Attachment>({
          folder: this.attachmentsFoldersMap[this.currentUploader],
          title: files[index].name,
          file: files[index],
        })
      );
      this.updateAttachmentsSize();
    }
  }

  updateAttachmentsSize() {
    let _size = 0;
    Object.keys(this.projectAttachments).forEach((type) => {
      for (let j = 0; j < this.projectAttachments[type as keyof Omit<CurrentProjectAttachments, 'clone'>].length; j++) {
        _size += this.projectAttachments[type as keyof Omit<CurrentProjectAttachments, 'clone'>][j].file.size;
      }
    });

    this._attachmentsSize.set(_size);
  }

  getAttachments(type: keyof Omit<CurrentProjectAttachments, 'clone'>) {
    return this.projectAttachments[type];
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

  deleteAttachment(type: keyof Omit<CurrentProjectAttachments, 'clone'>, attachment: Attachment) {
    if (this.projectAttachments[type] && this.projectAttachments[type].find((att) => att.id === attachment.id)) {
      const _attachmentIndex = this.projectAttachments[type].findIndex((att) => att.id === attachment.id);
      this.projectAttachments[type] = [
        ...this.projectAttachments[type].slice(0, _attachmentIndex),
        ...this.projectAttachments[type].slice(_attachmentIndex + 1),
      ];
      this.updateAttachmentsSize();
    }
  }

  onStartDateChange() {
    this.startDate.patchValue(this.startDate.value ? this._transformDate(this.startDate.value) : '', {
      emitEvent: false,
    });
  }

  onEndDateChange() {
    this.endDate.patchValue(this.endDate.value ? this._transformDate(this.endDate.value) : '', {
      emitEvent: false,
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
    let developerId: number | null = null;
    this.developerRegistrationService
      .checkDeveloperName(this.form.value.developerName!)
      .pipe(
        map((res) => {
          if (res.length) {
            developerId = res[0].id;
            return true;
          } else {
            this.toast.error(this.lang.map.error_with_developer_name);
            return false;
          }
        })
      )
      .pipe(filter((res) => res))
      .pipe(switchMap(() => this.developerRegistrationService.uploadFiles(this.projectAttachments)))
      .pipe(
        tap((res) => {
          if (res) {
            res.forEach((attachment) => {
              const [type, i] = attachment.description.split('---');
              const idx = parseInt(i);
              this.projectAttachments[type as keyof Omit<CurrentProjectAttachments, 'clone'>][idx - 1].id =
                attachment.id;
            });
          }
        })
      )
      .pipe(switchMap(() => this.developerRegistrationService.registerCurrentProject(this._toModel(developerId!))))
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
        this.projectAttachments = new CurrentProjectAttachments();
      });
  }

  private _toModel(developer_id: number) {
    return new CurrentProjectData().clone<CurrentProjectData>({
      developer_id: developer_id,
      projectName: this.form.value.projectName as string,
      location: this.form.value.location as string,
      startDate: this.form.value.startDate as string,
      endDate: this.form.value.endDate as string,
      licenseAttachments: this.projectAttachments['license'].map((a) => CurrentProjectData.toFileId(a.id)),
      licensePlansAttachments: this.projectAttachments['licensePlans'].map((a) => CurrentProjectData.toFileId(a.id)),
      unitsAttachments: this.projectAttachments['units'].map((a) => CurrentProjectData.toFileId(a.id)),
      technicalReportAttachments: this.projectAttachments['technicalReport'].map((a) =>
        CurrentProjectData.toFileId(a.id)
      ),
      financialReportAttachments: this.projectAttachments['financialReport'].map((a) =>
        CurrentProjectData.toFileId(a.id)
      ),
      warrantyAgreementAttachments: this.projectAttachments['warrantyAgreement'].map((a) =>
        CurrentProjectData.toFileId(a.id)
      ),
      saleContractsAttachments: this.projectAttachments['saleContracts'].map((a) => CurrentProjectData.toFileId(a.id)),
      sampleSaleContractsAttachments: this.projectAttachments['sampleSaleContracts'].map((a) =>
        CurrentProjectData.toFileId(a.id)
      ),
    });
  }

  private _transformDate(date: any) {
    return this.datePipe.transform(date, 'yyyy-MM-dd', undefined);
  }
}
