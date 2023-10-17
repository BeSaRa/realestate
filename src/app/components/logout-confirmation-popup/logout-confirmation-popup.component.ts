import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { CmsAuthenticationService } from '@services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslationService } from '@services/translation.service';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
@Component({
  selector: 'app-logout-confirmation-popup',
  standalone: true,
  imports: [
    CommonModule,  
    MatSnackBarModule,
    ButtonComponent,
    IconButtonComponent,
  ],
  templateUrl: './logout-confirmation-popup.component.html',
  styleUrls: ['./logout-confirmation-popup.component.scss']
})
export class LogoutConfirmationPopupComponent {
  dialogRef = inject(MatDialogRef);
  authService = inject(CmsAuthenticationService);
  snackbar = inject(MatSnackBar);
  lang = inject(TranslationService);

  confirm(result: boolean): void {
    if (result) {
      this.authService.logout().subscribe(() => {
        console.log("this.lang.isLtr", this.lang.isLtr)
        this.snackbar.open(this.lang.map.logged_out_successfully, '', { verticalPosition: 'top', horizontalPosition:this.lang.isLtr ? 'left' : 'right'  });
      });
    }
    this.dialogRef.close();
  }
}
