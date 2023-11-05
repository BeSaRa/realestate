import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { TextareaComponent } from '@components/textarea/textarea.component';
import { TranslationAddContract } from '@contracts/translation-contract';
import { LangCodes } from '@enums/lang-codes';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { catchError, tap } from 'rxjs';

@Component({
  selector: 'app-translation-popup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    InputComponent,
    TextareaComponent,
    ButtonComponent,
    IconButtonComponent,
  ],
  templateUrl: './translation-popup.component.html',
  styleUrls: ['./translation-popup.component.scss'],
})
export class TranslationPopupComponent implements OnInit {
  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  toast = inject(ToastService);

  form = this.fb.nonNullable.group({
    localizationKey: ['', [CustomValidators.required]],
    arName: ['', [CustomValidators.required]],
    enName: ['', [CustomValidators.required]],
  });

  ngOnInit(): void {
    this.listenToLanguageChanges();
  }

  private listenToLanguageChanges() {
    this.lang.change$.subscribe((current) => {
      const overlayWrapper = document.querySelectorAll<HTMLDivElement>('.cdk-global-overlay-wrapper');
      overlayWrapper.forEach((item: HTMLDivElement) => {
        item.dir = current.direction;
      });
    });
  }

  getKey() {
    return this.form.controls.localizationKey.value;
  }

  getArName() {
    return this.form.controls.arName.value;
  }

  getEnName() {
    return this.form.controls.enName.value;
  }

  onAdd() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const translations: TranslationAddContract[] = [
      {
        key: this.getKey(),
        language: LangCodes.AR,
        value: this.getArName(),
      },
      {
        key: this.getKey(),
        language: LangCodes.EN,
        value: this.getEnName(),
      },
    ];

    this.lang
      .add(translations)
      .pipe(
        tap(() => {
          this.toast.success(this.lang.map.translation_added_successfully);
        }),
        catchError((err) => {
          this.toast.error(this.lang.map.translation_adding_failed);
          throw err;
        })
      )
      .subscribe();
    this.form.reset();
  }
}
