import { CmsService } from '@abstracts/cms.service';
import { Injectable } from '@angular/core';
import { DeveloperRegistration } from '@models/developer-registration';

@Injectable({
  providedIn: 'root',
})
export class DeveloperRegistrationService extends CmsService<DeveloperRegistration> {
  serviceName = 'DeveloperRegistrationService';
  collectionName = 'real_estate_developers';
}
