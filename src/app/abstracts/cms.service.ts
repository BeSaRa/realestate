import { inject } from '@angular/core';
import { UrlService } from '@services/url.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CastResponse } from 'cast-response';

export abstract class CmsService<T, PrimaryType = number> {
  private urlService = inject(UrlService);
  private http = inject(HttpClient);
  abstract collectionName: string;

  @CastResponse(undefined, { unwrap: 'data' })
  load(): Observable<T[]> {
    return this.http.get<T[]>(this.urlService.URLS.BASE_URL + 'items/' + this.collectionName);
  }

  @CastResponse(undefined, { unwrap: 'data' })
  loadById(id: PrimaryType): Observable<T> {
    return this.http.get<T>(this.urlService.URLS.BASE_URL + 'items/' + this.collectionName + '/' + id);
  }
}
