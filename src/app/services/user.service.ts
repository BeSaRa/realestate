import { inject, Injectable } from '@angular/core';
import { DialogService } from './dialog.service';
import { LoginPopupComponent } from '@components/login-popup/login-popup.component';
import { UrlService } from './url.service';
import { TranslationService } from './translation.service';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { UserPreferencePopupComponent } from '@components/user-preference-popup/user-preference-popup.component';
import { UserInfo } from '@models/user-info';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CastResponse } from 'cast-response';
import * as qs from 'qs';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  dialog = inject(DialogService);
  urlService = inject(UrlService);
  lang = inject(TranslationService);
  http = inject(HttpClient);

  currentUserSubject$ = new ReplaySubject<UserInfo>(1);
  currentUser$ = this.currentUserSubject$.asObservable();

  openLoginPopup() {
    this.dialog.open(LoginPopupComponent);
  }

  onStuffLogin() {
    window.location.href = this.urlService.URLS.ADMIN;
  }

  openUserPreferencesPopup() {
    this.dialog.open(UserPreferencePopupComponent);
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
        this.currentUserSubject$.next(data);
      }
      ));
  }
}
