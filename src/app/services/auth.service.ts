import { inject, Injectable } from '@angular/core';
import { catchError, exhaustMap, filter, map, merge, Observable, of, Subject, tap, throwError } from 'rxjs';
import { CredentialsContract } from '@contracts/credentials-contract';
import { AuthProviders } from '@enums/auth-providers';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { AuthenticationData, AuthenticationMode } from '@directus/sdk';
import { CastResponse } from 'cast-response';
import { TokenService } from '@services/token.service';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private urlService = inject(UrlService);
  private tokenService = inject(TokenService);
  refresh$ = new Subject<AuthenticationMode>();
  private authenticated = false;
  logout$ = new Subject<void>();
  login$ = new Subject<void>();
  authenticatedStatusChanged$ = merge(this.login$, this.logout$).pipe(map(() => this.authenticated));
  document = inject(DOCUMENT);

  constructor() {
    this.listenToRefreshToken();
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  /**
   * @description login method if you did not provide the provider the default one will be the LDAP
   * @param credentials
   * @param provider
   */
  login(credentials: Partial<CredentialsContract>, provider?: AuthProviders): Observable<AuthenticationData> {
    // override it here may be by mistake someone ask for the cookie, because cookie it will not work if the front-end not on the same domain of backend
    credentials.mode = 'json';
    provider = credentials.identifier?.includes('@') ? AuthProviders.DEFAULT : AuthProviders.LDAP;
    return this._login(credentials, provider).pipe(
      catchError((err) => {
        this.authenticated = false;
        return throwError(() => err);
      }),
      tap((data) => {
        this.updateToken(data);
      })
    );
  }

  /**
   * @description this method to check only which type of login to proceed with
   * @param credentials
   * @param provider
   * @private
   */
  @CastResponse(undefined, { unwrap: 'data' })
  private _login(credentials: Partial<CredentialsContract>, provider: AuthProviders): Observable<AuthenticationData> {
    return provider === AuthProviders.DEFAULT ? this.defaultLogin(credentials) : this.ldapLogin(credentials);
  }

  /**
   * @description login with username/password it is called default/local login
   * @param credentials
   * @private
   */
  private defaultLogin(credentials: Partial<CredentialsContract>): Observable<AuthenticationData> {
    if (credentials.identifier) {
      credentials.email = credentials.identifier;
      delete credentials.identifier;
    }
    return this.http.post<AuthenticationData>(this.urlService.URLS.AUTH, credentials);
  }

  /**
   * @description login with through ldap with identifier/password
   * @param credentials
   * @private
   */
  private ldapLogin(credentials: Partial<CredentialsContract>): Observable<AuthenticationData> {
    return this.http.post<AuthenticationData>(this.urlService.URLS.AUTH_LDAP, credentials);
  }

  /**
   * @description make logout from current session in directus
   */
  logout(): Observable<void> {
    return this.http
      .post<void>(
        this.urlService.URLS.LOGOUT,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => {
          this.authenticated = false;
          this.tokenService.clear();
          this.logout$.next();
        })
      );
  }

  /**
   * @description to listen to the refresh token Trigger that emit from token service to call a refresh method
   * @private
   */
  private listenToRefreshToken() {
    merge(this.tokenService.refreshTokenTrigger$, this.refresh$)
      .pipe(
        exhaustMap((mode) =>
          this.refresh(mode)
            .pipe(
              catchError(() => {
                this.tokenService.clear();
                this.authenticated = false;
                this.logout$.next();
                return of(false);
              })
            )
            .pipe(filter((value): value is AuthenticationData => !!value))
        )
      )
      .subscribe();
  }

  /**
   * @description method to the API to refresh token and get a new access token
   * @param mode
   * @private
   */
  @CastResponse(undefined, { unwrap: 'data' })
  refresh(mode: AuthenticationMode): Observable<AuthenticationData> {
    return this.http
      .post<AuthenticationData>(
        this.urlService.URLS.REFRESH_TOKEN,
        {
          mode,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(tap((data) => this.updateToken(data)));
  }
  /**
   * @description set a new token for token service
   * @param data
   * @private
   */
  private updateToken(data: AuthenticationData): void {
    this.authenticated = true;
    this.tokenService.setToken(data.access_token, data.expires);
    this.login$.next();
  }

  getGuestToken(): Observable<string> {
    return this.http.get<string>(this.urlService.URLS.AUTH_GUEST).pipe(
      tap((token) => {
        this.tokenService.setGuestToken(token);
      })
    );
  }

  loginByQatarPass(): void {
    const url = this.document.defaultView?.location.href;
    if (!url) return;
    location.href = 'https://stgqrepcms.aqarat.gov.qa/auth/login/nas?redirect=' + url;
  }
}
