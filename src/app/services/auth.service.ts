import { Injectable, inject } from '@angular/core';
import { Observable, OperatorFunction, tap, map, from, BehaviorSubject, switchMap, mergeMap } from 'rxjs';
import { DirectusClientService } from './directus-client.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { CastResponse } from 'cast-response';
import { CredentialsContract } from '@contracts/credentials-contract';
import { AuthenticationDataModel } from '@models/authentication-data';
import { TokenService } from './token.service';
import { logout, readMe } from '@directus/sdk';
import { UserInfo } from '@models/user-info';
import { userInfo } from 'os';
import { TranslationService } from './translation.service';

export type KeysEnum<T> = { [P in keyof Required<T>]: true };
@Injectable({
    providedIn: 'root'
})

export class CmsAuthenticationService {

    lang = inject(TranslationService);
    directusService = inject(DirectusClientService);
    config = this.directusService.config;
    urlService = inject(UrlService)
    http = inject(HttpClient);
    tokenService = inject(TokenService);
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    private isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    currentUserSubject$: BehaviorSubject<UserInfo> = new BehaviorSubject<UserInfo>(new UserInfo().clone<UserInfo>({
        id: '',
        title: '',
        first_name: '',
        last_name: '',
        email: '',
        language: '',
        email_notifications: false,
    }));
    public currentUser = this.currentUserSubject$.asObservable();


    @CastResponse(() => AuthenticationDataModel, { unwrap: 'data', fallback: '$default' })
    private _login(credentials: Partial<CredentialsContract>): Observable<AuthenticationDataModel> {
        return this.http.post<AuthenticationDataModel>(this.urlService.URLS.AUTH, credentials);
    }

    login(credentials: Partial<CredentialsContract>): Observable<AuthenticationDataModel> {
        return this._login(credentials).pipe(this.afterAuthenticate());
    }

    // private afterAuthenticate(): OperatorFunction<AuthenticationDataModel, AuthenticationDataModel> {
    //     return source => {
    //         return source.pipe(
    //             tap(data => this.tokenService.saveToken(data)),
    //             tap((data) => this.setClientAccesToken(data.access_token)),
    //             tap(() => this._getCurrentUser())
    //             // tap(() => window.location.reload()),
    //             tap(userInfo => this.setCurrentUser(userInfo)),
    //             tap(() => (this.isAuthenticatedSubject.next(true)))
    //         );
    //     };
    // }

    private afterAuthenticate(): OperatorFunction<AuthenticationDataModel, AuthenticationDataModel> {
        return source => {
            return source.pipe(
                tap(data => this.tokenService.saveToken(data)),
                tap(data => this.setClientAccesToken(data.access_token)),
                switchMap((data) => this._getCurrentUser().pipe(
                    map(userInfo => {
                        this.setCurrentUser(userInfo);
                        this.isAuthenticatedSubject.next(true);
                        return data;
                    })
                ))
            );
        };
    }


    private setClientAccesToken(token: string | null) {
        this.directusService.client.setToken(token);
    }

    private _logOut(refreshToken: string | undefined): Observable<void> {
        return from(this.directusService.client.request(logout(refreshToken)));
    }

    logout(): Observable<void> {
        return from(this.tokenService.getRefreshToken()).pipe(
            switchMap(refreshToken => this._logOut(refreshToken).pipe(
                tap(_ => this.tokenService.resetToken()),
                tap(() => this.setClientAccesToken(null)),
                tap(() => (this.isAuthenticatedSubject.next(false))),
                tap(() => this.removeCurrentUser()),
                // tap(() => window.location.reload())
            ))
        );
    }

    loadUserFromLocalStorage(): Observable<UserInfo> {
        if (this.currentUserSubject$.value.id == '') {
            let fromLocalStorage = localStorage.getItem('user-profile');
            if (fromLocalStorage) {
                let userInfo = JSON.parse(fromLocalStorage);
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
        this.lang.setCurrent(this.lang.languages.find(x => x.code === userInfo.language) ?? this.lang.getCurrent());
        localStorage.setItem('user-profile', JSON.stringify(userInfo));
    }

    removeCurrentUser() {
        this.currentUserSubject$.next(new UserInfo().clone<UserInfo>({
            id: '',
            title: '',
            first_name: '',
            last_name: '',
            email: '',
            language: '',
            email_notifications: false,
        }));
        localStorage.removeItem('user-profile');
    }

}
