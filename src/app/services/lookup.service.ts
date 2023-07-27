import { inject, Injectable } from '@angular/core';
import { UrlService } from '@services/url.service';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CastResponse } from 'cast-response';
import { LookupsContract } from '@contracts/lookups-contract';
import { LookupsMap } from '@models/lookups-map';
import { Lookup } from '@models/lookup';

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  urlService = inject(UrlService);
  http = inject(HttpClient);
  lookups!: LookupsContract;

  @CastResponse(() => LookupsMap, {
    shape: {
      'propertyTypeList.*': () => Lookup,
      'rentPurposeList.*': () => Lookup,
      'zoneList.*': () => Lookup,
      'municipalityList.*': () => Lookup,
    },
  })
  private _load(): Observable<LookupsMap> {
    return this.http.get<LookupsMap>(this.urlService.URLS.LOOKUPS);
  }

  load(): Observable<LookupsMap> {
    return this._load().pipe(tap((response) => (this.lookups = response)));
  }
}
