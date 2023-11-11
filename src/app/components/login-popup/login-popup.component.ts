import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { TextareaComponent } from '@components/textarea/textarea.component';
import { TranslationService } from '@services/translation.service';
import { CmsAuthenticationService } from '@services/auth.service';
import { CustomValidators } from '@validators/custom-validators';
import { catchError, tap } from 'rxjs';
import { CredentialsContract } from '@contracts/credentials-contract';
import { ToastService } from '@services/toast.service';

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
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss'],
})
export class LoginPopupComponent {
  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  toast = inject(ToastService);
  authService = inject(CmsAuthenticationService);

  dialogRef = inject(MatDialogRef);

  LoginForm = this.fb.group({
    identifier: ['', [CustomValidators.required]],
    password: ['', [CustomValidators.required]],
  });

  isLoggedInFailed = false;
  errorMessage = '';

  getIdentifier() {
    return this.LoginForm.controls['identifier'].value;
  }

  getPassword() {
    return this.LoginForm.controls['password'].value;
  }

  onLogin() {
    this.LoginForm.markAllAsTouched();
    if (this.LoginForm.invalid) {
      return;
    }
    const credentials: CredentialsContract = {
      identifier: this.getIdentifier(),
      password: this.getPassword(),
      mode: 'json',
    };
    this.authService
      .login(credentials)
      .pipe(
        tap(() => {
          this.isLoggedInFailed = false;
          this.dialogRef.close();
          this.toast.success(this.lang.map.logged_in_successfully, {
            verticalPosition: 'top',
            horizontalPosition: this.lang.isLtr ? 'left' : 'right',
          });
          this.LoginForm.reset();
        }),
        catchError((err) => {
          this.isLoggedInFailed = true;
          this.toast.error(this.lang.map.logged_in_failed, { verticalPosition: 'top' });
          throw err;
        })
      )
      .subscribe();
  }

  clearError() {
    this.isLoggedInFailed = false;
  }
}
