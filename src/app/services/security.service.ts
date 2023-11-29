import { inject, Injectable } from '@angular/core';
import { UrlService } from '@services/url.service';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SecurityModel } from '@models/security-model';
import { CastResponse } from 'cast-response';
import { Section } from '@models/section';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  urlService = inject(UrlService);
  private http = inject(HttpClient);

  @CastResponse(undefined, { unwrap: 'data' })
  private _load(): Observable<Record<string, SecurityModel>> {
    return this.http.get<Record<string, SecurityModel>>(this.urlService.URLS.SECURITY);
  }

  load(): Observable<Record<string, SecurityModel>> {
    return this._load().pipe(
      map((res) => {
        return Object.entries(res).reduce((acc, model) => {
          const [url, security] = model;
          const { sections } = security;

          return {
            ...acc,
            [url]: new SecurityModel().clone<SecurityModel>({
              ...security,
              ...{
                sections: Object.entries(sections).reduce((acc, [name, section]) => {
                  return {
                    ...acc,
                    [name]: new Section().clone({
                      ...section,
                    }),
                  };
                }, {}),
              },
            }),
          };
        }, {});
      })
    );
  }
}
