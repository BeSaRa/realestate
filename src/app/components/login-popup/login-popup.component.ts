import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { TextareaComponent } from '@components/textarea/textarea.component';
import { TranslationService } from '@services/translation.service';
import { AuthService } from '@services/auth.service';
import { CustomValidators } from '@validators/custom-validators';
import { CredentialsContract } from '@contracts/credentials-contract';
import { ToastService } from '@services/toast.service';
import { catchError, startWith, switchMap, throwError } from 'rxjs';
import { UserService } from '@services/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CmsErrorContract } from '@contracts/cms-error-contract';
import { CmsErrorStatus } from '@enums/cms-error-status';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss'],
})
export class LoginPopupComponent {
  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  toast = inject(ToastService);
  authService = inject(AuthService);
  userService = inject(UserService);
  dialogRef = inject(MatDialogRef);

  form = this.fb.group({
    identifier: ['', [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern("LDAP_USERNAME")]],
    password: ['', [CustomValidators.required, CustomValidators.maxLength(50)]],
  });

  invalidCredentials = false;
  isLoading = false;

  login() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    const credentials: CredentialsContract = {
      ...this.form.getRawValue(),
    };
    this.authService
      .login(credentials)
      .pipe(switchMap(() => this.userService.loadCurrentUserProfile()))
      .pipe(
        catchError((err: { error: CmsErrorContract }) => {
          this.isLoading = false;
          if (err?.error?.errors)
            err.error.errors.forEach((_err) => {
              if (_err.extensions.code === CmsErrorStatus.INVALID_CREDENTIALS) this.invalidCredentials = true;
              else
                this.toast.error(this.lang.map.unknown_error_occured_when_login, {
                  verticalPosition: 'top',
                  horizontalPosition: this.lang.isLtr ? 'left' : 'right',
                });
            });
          else
            this.toast.error(this.lang.map.unknown_error_occured_when_login, {
              verticalPosition: 'top',
              horizontalPosition: this.lang.isLtr ? 'left' : 'right',
            });
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        this.toast.success(this.lang.map.logged_in_successfully, {
          verticalPosition: 'top',
          horizontalPosition: this.lang.isLtr ? 'left' : 'right',
        });
        this.dialogRef.close();
      });
  }

  clearError() {
    this.invalidCredentials = false;
  }
}
