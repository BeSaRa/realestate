import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { TokenService } from '@services/token.service';

import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { CmsAuthenticationService } from '@services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  token!: string;
  private isRefreshing = false;
  public tokenService = inject(TokenService);
  public authService = inject(CmsAuthenticationService);
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.includes('http') || request.url.includes('refresh')) return next.handle(request);
    return from(this.tokenService.getAccessToken()).pipe(
      map((token) => {
        if (token == undefined || token == '') this.token = 'lyHWSTHj1SBm9IRECnLAHviNHnXGaS27';
        else this.token = token;
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        return request;
      }),
      switchMap((req) => {
        return next.handle(req).pipe(
          catchError((error) => {
            if (error instanceof HttpErrorResponse && !req.url.includes('auth/login') && error.status === 401) {
              return this.handle401Error(req, next);
            }

            return throwError(() => error);
          })
        );
      })
    );
  }
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      if (this.authService.isLoggedIn()) {
        return from(this.tokenService.getAccessToken()).pipe(
          switchMap(() => {
            this.isRefreshing = false;

            return next.handle(request);
          }),
          catchError((error) => {
            this.isRefreshing = false;

            if (error.status == '403') {
              this.authService.logout();
            }

            return throwError(() => error);
          })
        );
      }
    }

    return next.handle(request);
  }
}
