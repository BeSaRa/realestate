import { Injectable, inject } from '@angular/core';
import { DialogService } from './dialog.service';
import { LoginPopupComponent } from '@components/login-popup/login-popup.component';
import { UrlService } from './url.service';
// import { LogoutConfirmationPopupComponent} from '@components/logout-confirmation-popup/logout-confirmation-popup.component';
import { TranslationService } from './translation.service';
import { Observable, filter } from 'rxjs';
import { UserPreferencePopupComponent } from '@components/user-preference-popup/user-preference-popup.component';
import { UserInfo } from '@models/user-info';
import { CmsAuthenticationService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { CastResponse } from 'cast-response';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  dialog = inject(DialogService);
  urlService = inject(UrlService);
  lang = inject(TranslationService);
  http = inject(HttpClient);

  openLoginPopup() {
    this.dialog.open(LoginPopupComponent);
  }

  OnStaffLogin() {
    window.location.href = this.urlService.URLS.ADMIN;
  }

  openUserPreferncePopup(){
    this.dialog.open(UserPreferencePopupComponent)
  }

  @CastResponse(() => UserInfo, { unwrap: 'data', fallback: '$default' })
  updateUser(userInfo: UserInfo) : Observable<UserInfo>
  {
   return this.http.patch<UserInfo>(this.urlService.URLS.USERS + '/' + userInfo.id, userInfo);
    
  }
}
