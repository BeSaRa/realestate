import { Injectable } from '@angular/core';
import { CmsService } from '@abstracts/cms.service';
import { Survey } from '@models/survey';

@Injectable({
  providedIn: 'root',
})
export class SurveyService extends CmsService<Survey> {
  override serviceName = 'SurveyService';
  override collectionName = 'surveys';
}
