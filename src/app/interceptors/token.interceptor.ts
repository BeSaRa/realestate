import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { TokenService } from '@services/token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  token!: string;
  public tokenService = inject(TokenService);
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.includes('http') || request.url.includes('refresh'))
    {
      return next.handle(request);
    } 
    return from(this.tokenService.getAccessToken())
      .pipe(
        switchMap(token => {
          if (token == undefined || token =='')
            this.token = 'lyHWSTHj1SBm9IRECnLAHviNHnXGaS27';
          else this.token = token
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${this.token}`,

            },
          });
          return next.handle(request);
        })
      );
  }
}
