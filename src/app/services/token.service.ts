import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { Observable, from, tap, of } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { Storage } from '@models/storage';
import { AuthenticationDataModel } from '@models/authentication-data';
@Injectable({
  providedIn: 'root',
})

export class TokenService {

  private readonly urlService = inject(UrlService);
  http = inject(HttpClient);

  private refreshInProgress?: Observable<Storage>;
  Storage: Storage = new Storage();
  // current user id after authenticate; this is used to prevent access token from overwriting
  // by another login from the same browser.
  private userId?: string;

  constructor() {
    const storage = Storage.load().subscribe(x => {
      if (x) {
        this.userId = this.decodeUserId(x.accessToken);
      }
    }
    );
  }
  
  getToken() {
    Storage.load().subscribe(x => {
      if (!x) {
        throw new Error("never login");
      }

      const expiresAt = x.expiresAt;
      if (expiresAt < Date.now() + 30000) {
        if (this.refreshInProgress) {
          return this.waitForRefresh();
        }

        this.refresh(x);
        return this.waitForRefresh();
      }

      this.Storage = x;
      return of(this.Storage);
    });
    return of(this.Storage);
  }

  getAccessToken(): string {
    const storage = this.getToken();
    const userId = this.decodeUserId(this.Storage.accessToken);
    if (this.userId !== userId) {
      throw new Error('user mismatch');
    }
    return this.Storage.accessToken;
  }

  getRefreshToken(): string {
    const storage = this.getToken();
    return this.Storage.refreshToken;
  }

  private waitForRefresh(): Observable<Storage> {
    if (!this.refreshInProgress) {
      throw new Error("no refresh in progress");
    }

    try {
      return this.refreshInProgress;
    } finally {
      this.refreshInProgress = undefined;
    }
  }

  private refresh(storage: Storage): void {
    const refreshPromise = async () => {
      const refreshToken = storage.refreshToken;
      this._refresh(refreshToken).pipe(
        tap((x) => {
          if (x) {
            storage = new Storage(x);
            storage.save();
            return storage;
          } else {
            throw new Error("refresh failure");
          }
        })
      );
    };

    // this.refreshInProgress = refreshPromise();
  }

  private _refresh(refreshToken: string): Observable<AuthenticationDataModel> {

    return from(this.http.post<AuthenticationDataModel>(this.urlService.URLS.REFRESH_TOKEN, {
      refresh_token: refreshToken,
      mode: "json",
    }));
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