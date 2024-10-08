import { Injectable } from '@angular/core';
import { CmsService } from '@abstracts/cms.service';
import { CastResponseContainer } from 'cast-response';
import { News } from '@models/news';
import { OptionsContract } from '@contracts/options-contract';
import { Observable } from 'rxjs';

@CastResponseContainer({
  $default: {
    model: () => News,
  },
})
@Injectable({
  providedIn: 'root',
})
export class NewsService extends CmsService<News> {
  serviceName = 'NewsService';
  collectionName = 'news';

  override load(options?: OptionsContract): Observable<News[]> {
    return super.load({ sort: '-date_created', ...options, 'filter[status][_eq]': 'published' } as OptionsContract);
  }
}
