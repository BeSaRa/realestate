import { inject, Injectable } from '@angular/core';
import { DialogService } from './dialog.service';
import { LoginPopupComponent } from '@components/login-popup/login-popup.component';
import { UrlService } from './url.service';
import { TranslationService } from './translation.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserPreferencePopupComponent } from '@components/user-preference-popup/user-preference-popup.component';
import { UserInfo } from '@models/user-info';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CastResponse } from 'cast-response';
import * as qs from 'qs';
import { AuthService } from '@services/auth.service';
import { ServiceContract } from '@contracts/service-contract';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
@Injectable({
  providedIn: 'root',
})
export class UserService extends RegisterServiceMixin(class {}) implements ServiceContract {
  serviceName = 'UserService';

  dialog = inject(DialogService);
  urlService = inject(UrlService);
  lang = inject(TranslationService);
  http = inject(HttpClient);
  authService = inject(AuthService);

  currentUser?: UserInfo;

  private _userInfoChanged = new BehaviorSubject<UserInfo | undefined>(undefined);
  userInfoChanged$ = this._userInfoChanged.asObservable();

  constructor() {
    super();
    this.listenToLogoutStatus();
  }

  openLoginPopup() {
    this.dialog.open(LoginPopupComponent);
  }

  onStuffLogin() {
    window.location.href = this.urlService.URLS.ADMIN;
  }

  openUserPreferencesPopup() {
    this.dialog.open(UserPreferencePopupComponent, { maxWidth: '95vw', maxHeight: '95vh' });
  }

  @CastResponse(() => UserInfo, { unwrap: 'data' })
  updateUser(userInfo: UserInfo): Observable<UserInfo> {
    return this.http.patch<UserInfo>(this.urlService.URLS.USERS + '/' + userInfo.id, userInfo);
  }

  @CastResponse(() => UserInfo, { unwrap: 'data' })
  _loadCurrentUserProfile(): Observable<UserInfo> {
    return this.http.get<UserInfo>(this.urlService.URLS.USERS + '/me', {
      params: new HttpParams({
        fromString: qs.stringify({ fields: ['*', 'role.id', 'role.admins_access', 'role.name'] }),
      }),
    });
  }

  loadCurrentUserProfile(): Observable<UserInfo> {
    return this._loadCurrentUserProfile().pipe(
      tap((data) => {
        this.currentUser = data;
        this._userInfoChanged.next(this.currentUser);
      })
    );
  }

  private listenToLogoutStatus() {
    this.authService.logout$.subscribe(() => {
      this.currentUser = undefined;
      this._userInfoChanged.next(this.currentUser);
    });
  }
}
