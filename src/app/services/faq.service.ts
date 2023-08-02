import { CmsService } from '@abstracts/cms.service';
import { Injectable } from '@angular/core';
import { Faq } from '@models/faq';
import { CastResponseContainer } from 'cast-response';

CastResponseContainer({
  $default: {
    model: () => Faq,
  },
});
@Injectable({
  providedIn: 'root',
})
export class FaqService extends CmsService<Faq> {
  serviceName = 'FaqService';
  collectionName = 'FAQ';
}
