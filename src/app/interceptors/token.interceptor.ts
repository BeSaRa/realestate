import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '@services/token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  tokenService = inject(TokenService);

  intercept(req: HttpRequest<object>, next: HttpHandler): Observable<HttpEvent<object>> {
    const isBackendURL = this.isBackendURL(req.url);
    return next.handle(
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
}
