import { CastResponse } from "cast-response"
import { UserInfo } from '@models/user-info';
import { Observable, OperatorFunction, tap, map, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHandler, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from '@angular/core';
import { UrlService } from "./url.service";
import { TokenService } from "./token.service";
import jwt_decode from 'jwt-decode';

export type KeysEnum<T> = { [P in keyof Required<T>]: true };
@Injectable({
    providedIn: 'root',
})
export class UsersService {

    private userId?: string;

    http = inject(HttpClient);
    urlService = inject(UrlService);
    tokenService = inject(TokenService);

    currentUser: BehaviorSubject<UserInfo> = new BehaviorSubject<UserInfo>({
        first_name: '',
        avatar: '',
        id: '',
        last_name: '',
    });

    @CastResponse(() => UserInfo, { unwrap: 'data', fallback: '$default' })
    private _getCurrentUser(): Observable<UserInfo> {
        const keys: KeysEnum<UserInfo> = {
            id: true,
            first_name: true,
            last_name: true,
            avatar: true,
        };
        const fields = Object.keys(keys).join(",");
        const params = new URLSearchParams();
        params.append("fields", fields);

        const accessToken = this.tokenService.getAccessToken();
        this.userId = this.decodeUserId(accessToken);
        const headers = new HttpHeaders();

        headers.set("Authorization", `Bearer ${accessToken}`);
        return this.http.get<UserInfo>(this.urlService.URLS.USERS + this.userId, { headers });
    }

    setCurrentUSer() {
        this._getCurrentUser().subscribe(user => {
             this.currentUser.next(user);
             localStorage.setItem('user-profile', JSON.stringify(user));
        });
    }

    removeCurrentUSer(){
        this.currentUser.next({
            first_name: '',
            avatar: '',
            id: '',
            last_name: '',
        });
        localStorage.removeItem('user-profile');
    }

    private decodeUserId(token: string | undefined) {
        const decoded = jwt_decode<{ id: string; }>(token ?? '');
        return decoded.id;
    }

    loadUserFromLocalStorage(): UserInfo {
        if (this.currentUser.value.id == '') {
          let fromLocalStorage = localStorage.getItem('user-profile');

          // TODO : Check if the token is expires then refresh token
          if (fromLocalStorage) {
            let userInfo = JSON.parse(fromLocalStorage);
            this.currentUser.next(userInfo);
          }
        }
        return this.currentUser.value;
    }
}