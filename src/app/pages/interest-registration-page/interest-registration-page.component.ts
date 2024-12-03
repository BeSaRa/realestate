import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from '@components/button/button.component';
import { InputComponent } from '@components/input/input.component';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { RECAPTCHA_SETTINGS, RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { exhaustMap, filter, map, Observable, of, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { CountryService } from '@services/country.service';
import { InterestService } from '@services/interest.service';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TextareaComponent } from '@components/textarea/textarea.component';
import { InterestedDeveloper } from '@contracts/interested-developer';
import { InterestedInvestor } from '@contracts/interested-investor';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { Attachment } from '@models/attachment';
import { DialogService } from '@services/dialog.service';
import { UserClick } from '@enums/user-click';
import { MatTooltip } from '@angular/material/tooltip';
import { NgxMaskDirective } from 'ngx-mask';
import { ControlDirective } from '@directives/control.directive';
import { ExhibitionService } from '@services/exhibition.service';

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
    SelectInputComponent,
    MatSlideToggle,
    TextareaComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatNoDataRow,
    IconButtonComponent,
    MatTooltip,
    NgxMaskDirective,
    ControlDirective,
  ],
  templateUrl: './interest-registration-page.component.html',
  styleUrl: './interest-registration-page.component.scss',
})
export default class InterestRegistrationPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  countryService = inject(CountryService);
  interestService = inject(InterestService);
  exhibitionService = inject(ExhibitionService);
  dialog = inject(DialogService);
  @ViewChild('recaptcha') recaptcha!: RecaptchaComponent;
  lang = inject(TranslationService);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  recaptchaSettings = inject(RECAPTCHA_SETTINGS);
  countries = this.countryService.get().pipe(shareReplay({ bufferSize: 1, refCount: true }));
  budgetRange = this.interestService.loadBudgetRange().pipe(shareReplay({ bufferSize: 1, refCount: true }));
  exhibition$ = this.exhibitionService.loadMain().pipe(shareReplay({ bufferSize: 1, refCount: true }));
  interestCategories = this.interestService.loadInterestTypes().pipe(
    map((res) => res.slice().reverse()),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  registered = false;
  recaptchaResolved = false;
  waitingRecaptchaToResolve = true;
  displayRecaptcha = false;
  save$ = new Subject<void>();
  attachments: Attachment[] = [];
  displayedColumns = ['fileName', 'actions'];

  investorForm = this.fb.nonNullable.group({
    type: ['INVESTOR', CustomValidators.required],
    name: ['', [CustomValidators.required, CustomValidators.maxLength(255)]],
    profession: ['', CustomValidators.maxLength(255)],
    email: ['', [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
    phoneNumber: ['', [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
    nationality: [null, [CustomValidators.required, CustomValidators.number]],
    countryOfResidence: [null, [CustomValidators.required, CustomValidators.number]],
    passportNumber: [null, [CustomValidators.pattern('ENG_NUM_ONLY'), CustomValidators.maxLength(20)]],
    numberOfFamilyMembers: [null, [CustomValidators.number]],
    interestPurchasing: [null],
    estimatedBudget: [null],
    investmentIntend: [null],
    resideInQatar: [false, CustomValidators.required],
    hasMoreInfo: [false, CustomValidators.required],
    moreInfo: [''],
    exhibitionId: [],
  });

  developerForm = this.fb.nonNullable.group({
    type: ['DEVELOPER', CustomValidators.required],
    name: ['', [CustomValidators.required, CustomValidators.maxLength(255)]],
    companyName: ['', [CustomValidators.required, CustomValidators.maxLength(255)]],
    email: ['', [CustomValidators.required, CustomValidators.pattern('EMAIL')]],
    phoneNumber: ['', [CustomValidators.required, CustomValidators.pattern('PHONE_NUMBER')]],
    soleDeveloper: [false, CustomValidators.required],
    wantPartnership: [false, CustomValidators.required],
    estimatedBudget: [null],
    hasMoreInfo: [false, CustomValidators.required],
    moreInfo: [''],
    exhibitionId: [],
  });

  deleteAttachment$ = new Subject<Attachment>();
  viewAttachment$ = new Subject<Attachment>();

  currentFormCode = signal<'DEVELOPER' | 'INVESTOR'>('INVESTOR');
  /********* static folders ids  *********/
  foldersMap = {
    DEVELOPER: '923BA9D5-E083-49C5-A1B7-4D5C28CC9A10',
    INVESTOR: '3062E004-4025-4A0D-B93C-34603D3513A3',
  };

  isDeveloper = computed(() => {
    return this.currentFormCode() === 'DEVELOPER';
  });

  isInvestor = computed(() => {
    return this.currentFormCode() === 'INVESTOR';
  });

  isCurrentForm(code: 'INVESTOR' | 'DEVELOPER') {
    return this.currentFormCode() === code;
  }

  currentForm = computed(() => (this.isDeveloper() ? this.developerForm : this.investorForm));

  recaptchaVisible = signal(false);

  // eslint-disable-next-line
  ngOnInit(): void {
    this.listenToSave();
    this.listenToDeleteAttachment();
    this.listenToViewAttachment();
    this.setDefaults();
  }

  private markFormDirty() {
    this.currentForm().markAllAsTouched();
    this.currentForm().markAsDirty();
  }

  private prepareModel(): Partial<InterestedInvestor | InterestedDeveloper> {
    return this.currentForm().value as unknown as Partial<InterestedInvestor | InterestedDeveloper>;
  }

  submitRequest() {
    this.markFormDirty();

    console.log(this.currentForm().value);
    if (this.currentForm().invalid) return;

    if (!this.recaptchaResolved) {
      this.displayRecaptcha = true;
      this.waitingRecaptchaToResolve = true;
    } else {
      this.completeSave();
    }
  }

  whenRecaptchaResolve(token: string) {
    if (!token) return;
    this.recaptchaResolved = true;
    this.waitingRecaptchaToResolve = false;
    this.completeSave();
  }

  private completeSave() {
    this.save$.next();
  }

  private listenToSave() {
    this.save$
      .pipe(map(() => this.prepareModel()))
      .pipe(filter(() => this.currentForm().valid))
      .pipe(exhaustMap((model) => this.interestService.saveInterest(model)))
      .pipe(
        switchMap((model) =>
          this.attachments.length
            ? this.interestService
                .attacheFilesToInterest({ ...this.prepareModel(), id: model.id }, this.attachments)
                .pipe(
                  tap(console.log),
                  map(() => true)
                )
            : of(true)
        )
      )
      .subscribe(() => {
        this.resetEveryThing();
        this.registered = true;
      });
  }

  openFileBrowse(uploader: HTMLInputElement) {
    uploader.click();
  }

  fileUploaderChange(uploader: HTMLInputElement) {
    if (uploader.files === null || uploader.files.length === 0) return;
    const files = structuredClone(uploader.files);
    uploader.value = '';
    for (const index in files) {
      if (isNaN(Number(index))) {
        continue;
      }

      this.attachments = this.attachments.concat(
        new Attachment().clone<Attachment>({
          folder: this.foldersMap[this.currentFormCode()],
          title: files[index].name,
          file: files[index],
        })
      );
    }

    this.interestService.uploadFilesToAttachmentsFolder(this.attachments).subscribe((result) => {
      this.attachments = this.attachments.map((item, index) => {
        item.id = result[index].id;
        return item;
      });
    });
  }

  private listenToDeleteAttachment() {
    this.deleteAttachment$
      .pipe(
        exhaustMap((attachment) => {
          return this.dialog
            .confirm(this.lang.map.confirm_delete, this.lang.map.deleting_item, {
              yes: this.lang.map.yes,
              no: this.lang.map.no,
            })
            .afterClosed()
            .pipe(
              filter((click) => {
                return click === UserClick.YES;
              })
            )
            .pipe(map(() => attachment));
        })
      )
      .pipe(exhaustMap((attachment) => this.interestService.deleteFile([attachment.id]).pipe(map(() => attachment))))
      .subscribe((attachment) => {
        this.attachments = this.attachments.filter((item) => item.id !== attachment.id);
      });
  }

  private listenToViewAttachment() {
    this.viewAttachment$
      .pipe(switchMap((attachment) => this.interestService.viewAttachment(attachment).afterClosed()))
      .subscribe();
  }

  private resetEveryThing() {
    this.recaptchaResolved = false;
    this.displayRecaptcha = false;
    this.waitingRecaptchaToResolve = false;
    this.recaptcha.reset();
    this.investorForm.reset();
    this.developerForm.reset();
    this.attachments = [];
    this.setDefaults();
  }

  changeCurrentTab(code: 'INVESTOR' | 'DEVELOPER'): void {
    if (this.currentForm().dirty || this.attachments.length) {
      this.dialog
        .confirm(this.lang.map.tab_change_data_lose_confirmation)
        .afterClosed()
        .pipe(
          filter((click) => {
            return click === UserClick.YES;
          }),
          switchMap(() =>
            this.attachments.length
              ? this.interestService.deleteFile(this.attachments.map((item) => item.id))
              : of(true)
          )
        )
        .subscribe(() => {
          this.resetEveryThing();
          this.currentFormCode.set(code);
        });
    } else {
      this.currentFormCode.set(code);
    }
  }

  private setDefaults() {
    this.exhibition$.subscribe((exhibition) => {
      if (!exhibition) return;
      this.developerForm.controls.exhibitionId.patchValue(exhibition.id as unknown as never);
      this.investorForm.controls.exhibitionId.patchValue(exhibition.id as unknown as never);
    });
  }
}
