import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInfo } from '@models/user-info';
import { CmsAuthenticationService } from '@services/auth.service';
import { TranslationService } from '@services/translation.service';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { IconButtonComponent } from '@components/icon-button/icon-button.component'
import { CustomValidators } from '@validators/custom-validators';
import { ButtonComponent } from '@components/button/button.component';
import { InputComponent } from '@components/input/input.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { UserService } from '@services/user.service';
import { tap } from 'rxjs'
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SwitchComponent } from '@components/switch/switch.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    MatSnackBarModule,
    MatCheckboxModule,
    SwitchComponent,
    MatSlideToggleModule
  ],
  templateUrl: './user-preference-popup.component.html',
  styleUrls: ['./user-preference-popup.component.scss']
})
export class UserPreferencePopupComponent implements OnInit {
  lang = inject(TranslationService);
  authService = inject(CmsAuthenticationService);
  userService = inject(UserService);
  snackbar = inject(MatSnackBar);

  dialogRef = inject(MatDialogRef);

  userInfo!: UserInfo;
  fb = inject(UntypedFormBuilder);
  form!: UntypedFormGroup;

  _buildForm(): void {
    this.form = this.fb.group(this.userInfo.buildForm());
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => this.userInfo = user);
    this._buildForm();
  }

  save() {
    let value = { ...this.form.value };
    Object.keys(value).forEach((key) => {
      if ((typeof value[key] === 'string' && value[key] === '') || value[key] === null) delete value[key];
    });
    this.userService.updateUser(value).pipe(
      tap((user) => {
        this.authService.setCurrentUser(user);
        this.dialogRef.close();
        this.snackbar.open(this.lang.map.user_info_has_been_updated_successfully, '', { verticalPosition: 'top', horizontalPosition: this.lang.isLtr ? 'left' : 'right' });
      })).subscribe();
  }
}
