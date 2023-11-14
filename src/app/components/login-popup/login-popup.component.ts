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
import { startWith, switchMap } from 'rxjs';
import { UserService } from '@services/user.service';

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
  authService = inject(AuthService);
  userService = inject(UserService);
  dialogRef = inject(MatDialogRef);

  form = this.fb.group({
    identifier: ['', [CustomValidators.required]],
    password: ['', [CustomValidators.required]],
  });

  isLoggedInFailed = false;

  login() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const credentials: CredentialsContract = {
      ...this.form.getRawValue(),
    };
    this.authService
      .login(credentials)
      .pipe(switchMap(() => this.userService.loadCurrentUserProfile()))
      .subscribe(() => {
        this.toast.success(this.lang.map.logged_in_successfully, {
          verticalPosition: 'top',
          horizontalPosition: this.lang.isLtr ? 'left' : 'right',
        });
        this.dialogRef.close();
      });
  }

  clearError() {
    this.isLoggedInFailed = false;
  }
}
