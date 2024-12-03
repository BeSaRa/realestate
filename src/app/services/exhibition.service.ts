import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { map, Observable, of } from 'rxjs';
import { Exhibition } from '@models/exhibition';
import { CastResponse } from 'cast-response';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root',
})
export class ExhibitionService {
  private readonly http = inject(HttpClient);
  private readonly urlService = inject(UrlService);

  @CastResponse(() => Exhibition)
  load(options?: unknown): Observable<Exhibition[]> {
    return this.http.get<Exhibition[]>(this.urlService.URLS.EXHIBITION, {
      params: {
        ...(options as object),
      },
    });
  }

  @CastResponse(() => Exhibition, { unwrap: 'data' })
  _loadQuery(query: string): Observable<Exhibition[]> {
    return this.http.get<Exhibition[]>(this.urlService.URLS.EXHIBITION, {
      params: new HttpParams({ fromString: query }),
    });
  }

  loadMain(
    options: { limit: number; filter: object } = { limit: 1, filter: { _and: [{ isMain: { _eq: true } }] } }
  ): Observable<Exhibition> {
    return this._loadQuery(qs.stringify(options)).pipe(map((value) => value[0]));
  }
}
