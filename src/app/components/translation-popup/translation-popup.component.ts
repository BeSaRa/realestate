import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { TextareaComponent } from '@components/textarea/textarea.component';
import { TranslationAddContract } from '@contracts/translation-contract';
import { LangCodes } from '@enums/lang-codes';
import { TranslationService } from '@services/translation.service';

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

  form = this.fb.nonNullable.group({
    localizationKey: ['', [Validators.required]],
    arName: ['', [Validators.required]],
    enName: ['', [Validators.required]],
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

    this.lang.add(translations).subscribe();
    this.form.reset();
  }
}
