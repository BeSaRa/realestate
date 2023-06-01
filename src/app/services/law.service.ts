import { CmsService } from '@abstracts/cms.service';
import { Injectable } from '@angular/core';
import { Law } from '@models/law';
import { CastResponseContainer } from 'cast-response';

@CastResponseContainer({
  $default: {
    model: () => Law,
  },
})
@Injectable({
  providedIn: 'root',
})
export class LawService extends CmsService<Law> {
  serviceName = 'LawService';
  collectionName = 'laws';
}
