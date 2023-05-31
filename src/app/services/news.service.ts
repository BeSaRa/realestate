import { Injectable } from '@angular/core';
import { CmsService } from '@abstracts/cms.service';
import { CastResponseContainer } from 'cast-response';
import { News } from '@models/news';

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
}
