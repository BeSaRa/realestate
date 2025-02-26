import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '@services/token.service';
import { AuthService } from '@services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  tokenService = inject(TokenService);
  authService = inject(AuthService);
  intercept(req: HttpRequest<object>, next: HttpHandler): Observable<HttpEvent<object>> {
    const isBackendURL = this.isBackendURL(req.url);
    const isRefreshTokenRequest = this.isAuthRefresh(req.url);
    return isRefreshTokenRequest
      ? next.handle(req)
      : next.handle(
          req.clone({
            setHeaders: {
              Authorization:
                'Bearer ' +
                (isBackendURL
                  ? this.tokenService.getToken()
                    ? this.tokenService.getToken()
                    : this.tokenService.getGuestToken()
                  : this.tokenService.getToken()
                  ? this.tokenService.getToken()
                  : 'lyHWSTHj1SBm9IRECnLAHviNHnXGaS27'),
            },
          })
        );
  }

  isBackendURL(url: string): boolean {
    return url.includes('mme-services');
  }

  isAuthRefresh(url: string) {
    return url.includes('auth/refresh');
  }
}
