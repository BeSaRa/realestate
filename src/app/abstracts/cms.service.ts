import { inject } from '@angular/core';
import { UrlService } from '@services/url.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CastResponse } from 'cast-response';
import { OptionsContract } from '@contracts/options-contract';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { ServiceContract } from '@contracts/service-contract';

export abstract class CmsService<T, PrimaryType = number>
  extends RegisterServiceMixin(class {})
  implements ServiceContract
{
  abstract serviceName: string;
  abstract collectionName: string;

  private urlService = inject(UrlService);
  private http = inject(HttpClient);

  @CastResponse(undefined, { unwrap: 'data', fallback: '$default' })
  load(options: OptionsContract = { limit: 50 }): Observable<T[]> {
    return this.http.get<T[]>(this.urlService.URLS.BASE_URL + '/items/' + this.collectionName, {
      params: new HttpParams({
        fromObject: { ...options },
      }),
    });
  }

  @CastResponse(undefined, { unwrap: 'data', fallback: '$default' })
  loadById(id: PrimaryType): Observable<T> {
    return this.http.get<T>(this.urlService.URLS.BASE_URL + '/items/' + this.collectionName + '/' + id);
  }

  loadFile(fileId: string): string {
    return this.urlService.URLS.BASE_URL + '/assets/' + fileId;
  }
}
