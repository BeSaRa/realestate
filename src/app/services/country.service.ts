import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Country } from '@models/country';
import { UrlService } from '@services/url.service';
import { CastResponse } from 'cast-response';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private readonly http = inject(HttpClient);
  private readonly urlService = inject(UrlService);
  private countries = signal<Country[]>([]);
  private loaded = computed(() => !!this.countries().length);

  @CastResponse(() => Country, {
    unwrap: 'data',
  })
  private _load(query?: unknown): Observable<Country[]> {
    return this.http.get<Country[]>(this.urlService.URLS.COUNTRIES, {
      params: {
        limit: -1,
        ...(query as object),
      },
    });
  }

  load(query?: unknown): Observable<Country[]> {
    return this._load(query).pipe(tap((countries) => this.countries.set(countries)));
  }

  get(query?: unknown): Observable<Country[]> {
    return this.loaded() ? of(this.countries()) : this.load(query);
  }
}
