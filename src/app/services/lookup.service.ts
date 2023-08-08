import { inject, Injectable } from '@angular/core';
import { UrlService } from '@services/url.service';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CastResponse } from 'cast-response';
import { LookupsContract } from '@contracts/lookups-contract';
import { LookupsMap } from '@models/lookups-map';
import { Lookup } from '@models/lookup';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';

@Injectable({
  providedIn: 'root',
})
export class LookupService extends RegisterServiceMixin(class {}) {
  serviceName = 'LookupService';
  urlService = inject(UrlService);
  http = inject(HttpClient);
  lookups!: LookupsContract;
  municipalitiesMap: Record<number, Lookup> = {};
  zonesMap: Record<number, Lookup> = {};

  rentLookups!: LookupsContract;
  roomsMap: Record<number, Lookup> = {};

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
    return this._load()
      .pipe(tap((response) => (this.rentLookups = response)))
      .pipe(
        tap(
          (res) =>
            (this.municipalitiesMap = res.municipalityList.reduce((acc, i) => {
              return { ...acc, [i.lookupKey]: i };
            }, {}))
        ),
        tap((res) => {
          this.zonesMap = res.zoneList.reduce((acc, i) => {
            return { ...acc, [i.lookupKey]: i };
          }, {});
        }),
        tap((res) => {
          this.roomsMap = res.rooms.reduce((acc, i) => {
            return { ...acc, [i.lookupKey]: i };
          }, {});
        })
      );
  }
}
