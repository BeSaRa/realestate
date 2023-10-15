import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { Observable, from, tap, of, map, lastValueFrom } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { Storage } from '@models/storage';
import { AuthenticationDataModel } from '@models/authentication-data';
import { DirectusClientService } from './directus-client.service';
import { refresh } from '@directus/sdk';
import { CastResponse } from 'cast-response';
@Injectable({
  providedIn: 'root',
})

export class TokenService {

  private readonly urlService = inject(UrlService);
  http = inject(HttpClient);
  private refreshInProgress?: Promise<Storage>;
  directusService = inject(DirectusClientService);
  // current user id after authenticate; this is used to prevent access token from overwriting
  // by another login from the same browser.
  private userId?: string;

  constructor() {
    const storage = Storage.load();
    if (storage) {
      this.userId = this.decodeUserId(storage.accessToken);
    }
  }


  private async getToken(): Promise<Storage | undefined> {
    const storage = Storage.load();
    if (!storage) {
      return undefined;
    }

    const expiresAt = storage.expiresAt;
    if (expiresAt < Date.now() + 516, 142) {
      if (this.refreshInProgress) {
        return await this.waitForRefresh();
      }

      this.refresh(storage);
      return await this.waitForRefresh();
    }

    return storage;
  }

  async getAccessToken(): Promise<string> {
    const storage = await this.getToken();
    return storage?.accessToken || '';
  }

  async getRefreshToken(): Promise<string | undefined> {
    const storage = await this.getToken();
    return storage?.refreshToken;
  }

  private async waitForRefresh(): Promise<Storage> {
    if (!this.refreshInProgress) {
      throw new Error("no refresh in progress");
    }
    try {
      return await this.refreshInProgress;
    } finally {
      this.refreshInProgress = undefined;
    }
  }

  private refresh(storage: Storage): void {
    const refreshPromise = async () => {
      const refreshToken = storage.refreshToken;
      const loginResult = await lastValueFrom(  this._refresh(refreshToken));

      if (loginResult) {
        console.log("refre", loginResult)
        storage = new Storage(loginResult);
        storage.save();
        return storage;
      } else {
        throw new Error("refresh failure");
      }
    };

    this.refreshInProgress = refreshPromise();
  }
  @CastResponse(() => AuthenticationDataModel, { unwrap: 'data', fallback: '$default' })
  private _refresh(refreshToken: string): Observable<AuthenticationDataModel> {
     return from(this.directusService.client.request<AuthenticationDataModel>(refresh('json', refreshToken)));
    // return this.http.post<AuthenticationDataModel>(this.urlService.URLS.REFRESH_TOKEN, { refresh_token: refreshToken });
  }

  saveToken(loginInfo: AuthenticationDataModel) {
    const storage = new Storage(loginInfo);
    storage.save();
    this.userId = this.decodeUserId(loginInfo.access_token);
  }

  resetToken() {
    Storage.reset();
    this.userId = undefined;
  }

  private decodeUserId(token: string) {
    const decoded = jwt_decode<{ id: string; }>(token);
    return decoded.id;
  }

}