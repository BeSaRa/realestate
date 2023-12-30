import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CriteriaContract } from '@contracts/criteria-contract';
import { FilterMessage } from '@models/filter-message';
import { CastResponse } from 'cast-response';
import { UrlService } from './url.service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterMessagesService {
  http = inject(HttpClient);
  urlService = inject(UrlService);

  @CastResponse(() => FilterMessage)
  loadMessages(criteria: CriteriaContract, indicatorType: 'sell' | 'rent' | 'mortgage' | 'owner' | 'ov' | 'broker') {
    const _url = this._getUrl(indicatorType);
    if (!_url) return of([]);
    return this.http.post<FilterMessage[]>(_url, criteria);
  }

  _getUrl(indicatorType: 'sell' | 'rent' | 'mortgage' | 'owner' | 'ov' | 'broker') {
    if (indicatorType === 'rent') return this.urlService.URLS.RENT_FILTER_MESSAGES;

    return '';
  }
}
