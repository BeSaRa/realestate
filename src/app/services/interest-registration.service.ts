import { CmsService } from '@abstracts/cms.service';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InterestRegistration } from '@models/interest-registration';
import { Lookup } from '@models/lookup';
import { CastResponse } from 'cast-response';

@Injectable({
  providedIn: 'root',
})
export class InterestRegistrationService extends CmsService<InterestRegistration> {
  override collectionName = 'interest_registration';
  override serviceName = 'InterestRegistrationService';

  private _categoryCollectionName = 'interest_category';
  private _apartmentCollectionName = 'interest_apartment';
  private _exhibitCollectionName = 'interest_exhibit';

  @CastResponse(() => Lookup, { unwrap: 'data' })
  private _loadLookups(collectionName: string) {
    return this.http.get<Lookup[]>(this.urlService.URLS.BASE_URL + '/items/' + collectionName, {
      params: new HttpParams({
        fromObject: { limit: 50 },
      }),
    });
  }

  loadCategories() {
    return this._loadLookups(this._categoryCollectionName);
  }
  loadApartments() {
    return this._loadLookups(this._apartmentCollectionName);
  }
  loadExhibits() {
    return this._loadLookups(this._exhibitCollectionName);
  }
}
