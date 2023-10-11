import { CastResponse } from "cast-response"
import { UserInfo } from '@models/user-info';
import { Observable, OperatorFunction, tap, map } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from '@angular/core';
import { UrlService } from "./url.service";
import { TokenService } from "./token.service";
// async getCurrentUser(): Promise<UserInfo> {
//     const keys: KeysEnum<UserInfo> = {
//       id: true,
//       first_name: true,
//       last_name: true,
//       avatar: true,
//     };
//     const fields = Object.keys(keys).join(",");
//     const params = new URLSearchParams();
//     params.append("fields", fields);

//     const accessToken = await this.transport.getAccessToken();
//     const user = await this.transport.get<UserInfo>("/users/me", {
//       params, accessToken
//     });

//     user.avatar = this.transport.assetsUrl(user.avatar, accessToken);
//     return user;
//   }

export type KeysEnum<T> = { [P in keyof Required<T>]: true };
@Injectable({
    providedIn: 'root',
  })
export class UsersService {
    http = inject(HttpClient);
    urlService = inject(UrlService);
    tokenService = inject(TokenService);
    currentUser?: UserInfo;

    @CastResponse(() => UserInfo, { unwrap: '', fallback: '$default' })
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

        const accessToken = this.tokenService.getToken();
        return this.http.post<UserInfo>(this.urlService.URLS.READ_ME, { params, accessToken });
    }

    setCurrentUSer() {
        this._getCurrentUser().subscribe(user => this.currentUser = user);
    }
}