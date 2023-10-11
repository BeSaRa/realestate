import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { TextareaComponent } from '@components/textarea/textarea.component';
import { TranslationService } from '@services/translation.service';
import { CmsAuthenticationService } from '@services/auth.service';
import { CustomValidators } from '@validators/custom-validators';
import { catchError, tap } from 'rxjs';
import { CredentialsContract } from '@contracts/credentials-contract';
import { CookieService } from 'ngx-cookie';
import { CookieModule } from 'ngx-cookie';
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
    MatSnackBarModule,
    CookieModule
  ],
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss'],
})
export class LoginPopupComponent implements OnInit {
  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  snackbar = inject(MatSnackBar);
  authService = inject(CmsAuthenticationService)
  
  dialogRef = inject(MatDialogRef);

  LoginForm = this.fb.group({
    identifier: ['', [CustomValidators.required]],
    password: ['', [CustomValidators.required]],
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
    const credentials: CredentialsContract = { identifier: this.getIdentifier(), password:this.getPassword(), mode: 'json'}
    this.authService.login(credentials).pipe(
      tap(() => {
        this.dialogRef.close()
        this.snackbar.open(this.lang.map.logged_in_successfully,'',{panelClass:'toast-success',verticalPosition:'top'});
        
      }),
      catchError((err) => {
        this.snackbar.open(this.lang.map.logged_in_failed,'',{panelClass:'toast-error',verticalPosition:'top'});
        throw err;
      })
    )
    .subscribe();
    this.LoginForm.reset();
  }
}
