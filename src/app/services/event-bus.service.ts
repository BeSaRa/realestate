import { Injectable, inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EventData } from '@models/event.class';
import { DialogService } from './dialog.service';
import { LoginPopupComponent } from '@components/login-popup/login-popup.component';
import { UrlService } from './url.service';

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
}
