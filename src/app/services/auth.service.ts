import { Injectable, inject } from '@angular/core';
import { Observable, OperatorFunction, tap, map, from, BehaviorSubject, switchMap, ReplaySubject } from 'rxjs';
import { DirectusClientService } from './directus-client.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { CastResponse } from 'cast-response';
import { CredentialsContract } from '@contracts/credentials-contract';
import { AuthenticationDataModel } from '@models/authentication-data';
import { TokenService } from './token.service';
import { logout, readMe } from '@directus/sdk';
import { UserInfo } from '@models/user-info';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class CmsAuthenticationService {
  lang = inject(TranslationService);
  directusService = inject(DirectusClientService);
  config = this.directusService.config;
  urlService = inject(UrlService);
  http = inject(HttpClient);
  tokenService = inject(TokenService);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject$ = new ReplaySubject<UserInfo | undefined>(1);
  public currentUser = this.currentUserSubject$.asObservable();

  @CastResponse(() => AuthenticationDataModel, { unwrap: 'data', fallback: '$default' })
  private _login(credentials: Partial<CredentialsContract>): Observable<AuthenticationDataModel> {
    let normalAuth = false;
    if (credentials.identifier?.includes('@')) {
      credentials.email = credentials.identifier;
      delete credentials.identifier;
      normalAuth = true;
    }
    return this.http.post<AuthenticationDataModel>(
      normalAuth ? this.urlService.URLS.EMAIL_PASSWORD_AUTH : this.urlService.URLS.AUTH,
      credentials
    );
  }

  login(credentials: Partial<CredentialsContract>): Observable<AuthenticationDataModel> {
    return this._login(credentials).pipe(this.afterAuthenticate());
  }

  private afterAuthenticate(): OperatorFunction<AuthenticationDataModel, AuthenticationDataModel> {
    return (source) => {
      return source.pipe(
        tap((data) => this.tokenService.saveToken(data)),
        tap((data) => this.setClientAccessToken(data.access_token)),
        switchMap((data) =>
          this._getCurrentUser().pipe(
            map((userInfo) => {
              this.setCurrentUser(userInfo);
              this.isAuthenticatedSubject.next(true);
              return data;
            })
          )
        )
      );
    };
  }

  private setClientAccessToken(token: string | null) {
    this.directusService.client.setToken(token);
  }

  private _logOut(refreshToken: string | undefined): Observable<void> {
    return from(this.directusService.client.request(logout(refreshToken)));
  }

  logout(): Observable<void> {
    return from(this.tokenService.getRefreshToken()).pipe(
      switchMap((refreshToken) =>
        this._logOut(refreshToken).pipe(
          tap((_) => this.tokenService.resetToken()),
          tap(() => this.setClientAccessToken(null)),
          tap(() => this.isAuthenticatedSubject.next(false)),
          tap(() => this.removeCurrentUser())
          // tap(() => window.location.reload())
        )
      )
    );
  }

  loadUserFromLocalStorage(): Observable<UserInfo | undefined> {
    let latestUserInfo: UserInfo | undefined = undefined;

    this.currentUserSubject$.subscribe({
      next: (userInfo) => {
        latestUserInfo = userInfo;
      },
    });

    if (!latestUserInfo) {
      const fromLocalStorage = localStorage.getItem('user-profile');
      if (fromLocalStorage) {
        const userInfo = JSON.parse(fromLocalStorage);
        this.isAuthenticatedSubject.next(true);
        this.setCurrentUser(new UserInfo().clone<UserInfo>(userInfo));
      }
    }
    return this.currentUser;
  }

  isLoggedIn() {
    return this.isAuthenticated$;
  }

  @CastResponse(() => UserInfo, { unwrap: 'data', fallback: '$default' })
  private _getCurrentUser(): Observable<UserInfo> {
    return from(this.directusService.client.request<UserInfo>(readMe()));
  }

  setCurrentUser(userInfo: UserInfo) {
    this.currentUserSubject$.next(userInfo);
    this.lang.setCurrent(this.lang.languages.find((x) => x.code === userInfo.language) ?? this.lang.getCurrent());
    localStorage.setItem('user-profile', JSON.stringify(userInfo));
  }

  removeCurrentUser() {
    this.currentUserSubject$.next(undefined);
    localStorage.removeItem('user-profile');
  }
}
