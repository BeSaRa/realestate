import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInfo } from '@models/user-info';
import { AuthService } from '@services/auth.service';
import { TranslationService } from '@services/translation.service';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { ButtonComponent } from '@components/button/button.component';
import { InputComponent } from '@components/input/input.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { UserService } from '@services/user.service';
import { catchError, finalize } from 'rxjs';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-user-preference-popup',
  standalone: true,
  imports: [
    CommonModule,
    IconButtonComponent,
    MatDialogModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectInputComponent,
    MatCheckboxModule,
    MatSlideToggleModule,
  ],
  templateUrl: './user-preference-popup.component.html',
  styleUrls: ['./user-preference-popup.component.scss'],
})
export class UserPreferencePopupComponent implements OnInit {
  lang = inject(TranslationService);
  authService = inject(AuthService);
  userService = inject(UserService);
  toast = inject(ToastService);

  dialogRef = inject(MatDialogRef);

  fb = inject(UntypedFormBuilder);
  form!: UntypedFormGroup;

  isLoading = false;

  _buildForm(): void {
    this.form = this.fb.group(new UserInfo().clone<UserInfo>({ ...this.userService.currentUser }).buildForm());
  }

  ngOnInit(): void {
    this._buildForm();
  }

  save() {
    if (this.form.invalid || this.isLoading) return;

    const value = { ...this.form.value };
    this.isLoading = true;

    this.userService
      .updateUser(value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        catchError((err) => {
          this.toast.success(this.lang.map.updating_user_info_failed, { verticalPosition: 'top' });
          throw err;
        })
      )
      .subscribe((updatedUser) => {
        this.userService.currentUser = updatedUser;
        this.dialogRef.close();
        this.toast.success(this.lang.map.user_info_has_been_updated_successfully, {
          verticalPosition: 'top',
          horizontalPosition: this.lang.isLtr ? 'left' : 'right',
        });
      });
  }
}
