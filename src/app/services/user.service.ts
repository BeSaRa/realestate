import { Injectable, inject } from '@angular/core';
import { DialogService } from './dialog.service';
import { LoginPopupComponent } from '@components/login-popup/login-popup.component';
import { UrlService } from './url.service';
import { LogoutConfirmationPopupComponent} from '@components/logout-confirmation-popup/logout-confirmation-popup.component';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  dialog = inject(DialogService);
  urlService = inject(UrlService);
  openLoginPopup() {
    this.dialog.open(LoginPopupComponent);
  }

  OnStaffLogin() {
    window.location.href = this.urlService.URLS.ADMIN;
  }

  openLogoutDialog(): void {
    this.dialog.open(LogoutConfirmationPopupComponent);
  }
}
