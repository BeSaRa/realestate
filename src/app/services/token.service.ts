import { inject, Injectable } from '@angular/core';
import { Subject, take, timer } from 'rxjs';
import { ConfigService } from '@services/config.service';
import { AuthenticationMode } from '@directus/sdk';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private config = inject(ConfigService);
  private accessToken: string | null = null;
  private expires: number | null = null;
  private expireAt: number | null = null;
  private refresh$ = new Subject<AuthenticationMode>();
  private mode: AuthenticationMode = 'json';
  refreshTokenTrigger$ = this.refresh$.asObservable();
  private _guestToken = '';

  getToken(): string | null {
    return this.accessToken;
  }

  setToken(token: string | null, expire: number | null): void {
    this.accessToken = token;
    this.expires = expire;
    this.calculateExpire();
    this.listenToLatestExpire();
    this.setTokenToStorage();
  }

  clear(): void {
    this.clearToken();
    this.clearTokenFromStorage();
  }

  private clearToken(): void {
    this.accessToken = null;
  }

  private calculateExpire(): void {
    this.expires ? (this.expireAt = Date.now() + (this.expires - this.config.CONFIG.REFRESH_TOKEN_BEFORE_MS)) : null;
  }

  refreshToken(): void {
    this.refresh$.next(this.mode);
  }

  private listenToLatestExpire() {
    this.expireAt
      ? timer(new Date(this.expireAt))
          .pipe(take(1))
          .subscribe(() => this.refreshToken())
      : null;
  }

  private setTokenToStorage(): void {
    localStorage.setItem(
      this.config.CONFIG.LOCAL_STORAGE_KEY,
      JSON.stringify({
        access_token: this.accessToken,
        expires: this.expires,
        expireAt: this.expireAt,
      })
    );
  }

  private clearTokenFromStorage(): void {
    localStorage.removeItem(this.config.CONFIG.LOCAL_STORAGE_KEY);
  }

  getTokenFromStorage(): void {
    const data = localStorage.getItem(this.config.CONFIG.LOCAL_STORAGE_KEY);
    if (!data) {
      return;
    }
    const { access_token, expires, expireAt } = JSON.parse(data);

    this.expires = expires;
    this.expireAt = expireAt;
    this.accessToken = access_token;
  }

  setGuestToken(value: string) {
    this._guestToken = value;
  }

  getGuestToken(): string {
    return this._guestToken;
  }
}
