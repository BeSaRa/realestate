import { Injectable } from '@angular/core';
import { CmsService } from '@abstracts/cms.service';

@Injectable({
  providedIn: 'root',
})
export class NewsService extends CmsService<any> {
  collectionName = 'news';
}
