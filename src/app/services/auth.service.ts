import { Injectable, inject } from '@angular/core';
import { Observable, OperatorFunction, tap, map, from, BehaviorSubject } from 'rxjs';
import { DirectusClientService } from './directus-client.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { CastResponse } from 'cast-response';
import { CredentialsContract } from '@contracts/credentials-contract';
import { AuthenticationDataModel } from '@models/authentication-data';
import { TokenService } from './token.service';
import { logout, readMe } from '@directus/sdk';
import { UserInfo } from '@models/user-info';

export type KeysEnum<T> = { [P in keyof Required<T>]: true };
@Injectable({
    providedIn: 'root'
})

export class CmsAuthenticationService {

    directusService = inject(DirectusClientService);
    config = this.directusService.config;
    urlService = inject(UrlService)
    http = inject(HttpClient);
    tokenService = inject(TokenService);
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    private isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    private currentUserSubject$: BehaviorSubject<UserInfo> = new BehaviorSubject<UserInfo>({
        first_name: '',
        avatar: '',
        id: '',
        last_name: '',
    });
    public currentUser= this.currentUserSubject$.asObservable();


    @CastResponse(() => AuthenticationDataModel, { unwrap: 'data', fallback: '$default' })
    private _login(credentials: Partial<CredentialsContract>): Observable<AuthenticationDataModel> {
        return this.http.post<AuthenticationDataModel>(this.urlService.URLS.AUTH, credentials);
    }

    login(credentials: Partial<CredentialsContract>): Observable<AuthenticationDataModel> {
        return this._login(credentials).pipe(this.afterAuthenticate());
    }

    private afterAuthenticate(): OperatorFunction<AuthenticationDataModel, AuthenticationDataModel> {
        return source => {
            return source.pipe(
                tap(data => this.tokenService.saveToken(data)),
                tap((data) => this.setClientAccesToken(data.access_token)),
                // tap(() => window.location.reload()),
                tap(_ => this.setCurrentUSer()),
                tap(() => (this.isAuthenticatedSubject.next(true)))
            );
        };
    }

    private setClientAccesToken(token: string | null) {
        this.directusService.client.setToken(token);
    }

    private _logOut(refreshToken: string | undefined): Observable<void> {
        return from(this.directusService.client.request(logout(refreshToken)));
    }

    logout() {
        this.tokenService.getRefreshToken().then(
            refreshToken => {
                return this._logOut(refreshToken).pipe(
                    tap(_ => this.tokenService.resetToken()),
                    tap(() => this.setClientAccesToken(null)),
                    tap(() => (this.isAuthenticatedSubject.next(false))),
                    tap(() => this.removeCurrentUSer()),
                    // tap(() => window.location.reload())
                ).subscribe();
            });
    }

    loadUserFromLocalStorage(): Observable<UserInfo> {
        if (this.currentUserSubject$.value.id == '') {
            let fromLocalStorage = localStorage.getItem('user-profile');
            if (fromLocalStorage) {
                let userInfo = JSON.parse(fromLocalStorage);
                this.isAuthenticatedSubject.next(true)
                this.currentUserSubject$.next(userInfo);
            }
        }
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated$;
    }
    @CastResponse(() => UserInfo, { unwrap: 'data', fallback: '$default' })
    private _getCurrentUser(): Observable<UserInfo> {
        const keys: KeysEnum<UserInfo> = {
            id: true,
            first_name: true,
            last_name: true,
            avatar: true,

        };
        const fields = Object.keys(keys).join(",");
        return from(this.directusService.client.request<UserInfo>(readMe({ fields: [fields] })));
    }

    setCurrentUSer() {
        this._getCurrentUser().subscribe(user => {
            this.currentUserSubject$.next(user);
            localStorage.setItem('user-profile', JSON.stringify(user));
        });
    }

    removeCurrentUSer() {
        this.currentUserSubject$.next({
            first_name: '',
            avatar: '',
            id: '',
            last_name: '',
        });
        localStorage.removeItem('user-profile');
    }

}
