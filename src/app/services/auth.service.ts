import { Injectable, inject } from '@angular/core';
import { Observable, OperatorFunction, tap, map } from 'rxjs';
import { DirectusClientService } from './directus-client.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { CastResponse } from 'cast-response';
import { CredentialsContract } from '@contracts/credentials-contract';
import { AuthenticationDataModel } from '@models/authentication-data';
import { TokenService } from './token.service';
import { UsersService } from './user.service';


@Injectable({
    providedIn: 'root'
})

export class CmsAuthenticationService {

    directusService = inject(DirectusClientService);
    client = this.directusService.client;
    config = this.directusService.config;
    urlService = inject(UrlService)
    http = inject(HttpClient);
    tokenService = inject(TokenService);
    userService = inject(UsersService);
    private authenticated = false;


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
                tap(_ => this.userService.setCurrentUSer()),
                tap(() => (this.authenticated = true)));
        };
    }

    private _logOut(refreshToken: string): Observable<Object> {
        return this.http.post(this.urlService.URLS.LOGOUT, {refresh_token:refreshToken},);
    }

    logout() {
        const refreshToken = this.tokenService.getRefreshToken();
        return this._logOut(refreshToken).pipe(
            tap(_ => this.tokenService.resetToken()),
            tap(() => (this.authenticated = false)),
            tap(_ => this.userService.removeCurrentUSer())
        );
    }

    

    isLoggedIn() {
        return this.authenticated;
    }
}
