import { Injectable, inject } from '@angular/core';
import { DirectusSchemaContract, } from '@contracts/directus-schema-contract';
import { AuthenticationData, LoginOptions, RestCommand, readProviders, readMe, logout } from '@directus/sdk';
import { Observable, OperatorFunction, tap, map } from 'rxjs';
import { DirectusClientService } from './directus-client.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { RentDefaultValues } from '@models/rent-default-values';
import { promises } from 'fs';
import { log } from 'console';
import { CastResponse } from 'cast-response';
import { CredentialsContract } from '@contracts/credentials-contract';
import { AuthenticationDataModel } from '@models/authentication-data';
import { UserInfo } from '@models/user-info';
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
                tap(data => this.tokenService.setToken(data.access_token)),
                tap(_ => this.userService.setCurrentUSer()),
                tap(() => (this.authenticated = true)));
        };
    }

    // setUser(user: UserInfo | undefined): void {
    //     this.currentUser = user;
    //     // this.token && this.eCookieService.putE(this.tokenStoreKey, this.token);
    //   }
    //   getCurrentUSer(): Observable<UserInfo> {
    //     return this.userService.().subscribe();
    // }
    async logout() {
        await this.client.request(logout());
    }

    isLoggedIn() {
        return this.getExpiration();
    }

    private getExpiration() {
        const session = sessionStorage.getItem("directus-sdk-js");
        if (session) {
            const expiration = JSON.parse(session).localExp;
            const current = Date.now();
            return current < expiration;
        }
        return false;
    }
}
