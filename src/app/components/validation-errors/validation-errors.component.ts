import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ValidationMessages, ValidationMessagesType } from '@constants/validation-messages';
import { LangKeysContract } from '@contracts/lang-keys-contract';
import { TranslationService } from '@services/translation.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-validation-errors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-errors.component.html',
  styleUrls: ['./validation-errors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationErrorsComponent {
  lang = inject(TranslationService);
  private _errors: ValidationErrors | null | undefined;

  errorContent?: string;

  set errors(errors: ValidationErrors | null | undefined) {
    this.getCurrentError(errors);
    this._errors = errors;
  }

  @Input()
  get errors(): ValidationErrors | null | undefined {
    return this._errors;
  }
  currentErrorSubject = new BehaviorSubject<string>('');
  currentError$?: Observable<string> = this.currentErrorSubject.asObservable();

  private getCurrentError(errors: ValidationErrors | null | undefined): void {
    if (!errors) {
      this.currentErrorSubject.next('');
      this.errorContent = undefined;
      return;
    }
    let currentNewError;
    for (const error of Object.entries(errors)) {
      currentNewError = error;
      if (currentNewError) break;
    }
    if (!currentNewError) {
      this.errorContent = undefined;
      return;
    }

    const validationKey = currentNewError[0] as keyof ValidationMessagesType;

    const validation = ValidationMessages[validationKey];
    if (typeof errors[validationKey] === 'object') this.errorContent = errors[validationKey][validationKey] as string;
    if (!validation) {
      this.currentErrorSubject.next(`Error: key not exists (${validationKey}) in ValidationMessages`);
      return;
    }
    // this.currentError = validation.replace ? validation.replace(validation.key) : identity(validation.key);
    const languageKey = validation.key as keyof LangKeysContract;
    this.lang.change$.subscribe( ()=> {
      this.currentErrorSubject.next(this.lang.map[languageKey]);
    })
  }
}
