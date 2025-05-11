import { CmsService } from '@abstracts/cms.service';
import { Injectable } from '@angular/core';
import { Attachment } from '@models/attachment';
import { CurrentProjectAttachments, DeveloperRegistration } from '@models/developer-registration';
import { isArray } from '@utils/utils';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeveloperRegistrationService extends CmsService<DeveloperRegistration> {
  serviceName = 'DeveloperRegistrationService';
  collectionName = 'real_estate_developers';

  uploadFiles(attachments: CurrentProjectAttachments[]): Observable<null | Attachment[]> {
    let hasAttachments = false;
    const formData = new FormData();
    for (let i = 0; i < attachments.length; i++) {
      Object.keys(attachments[i]).forEach((type) => {
        for (let j = 0; j < attachments[i][type as keyof Omit<CurrentProjectAttachments, 'clone'>].length; j++) {
          hasAttachments = true;
          const attachment = attachments[i][type as keyof Omit<CurrentProjectAttachments, 'clone'>][j];
          formData.append(`folder`, attachment.folder!);
          formData.append(`title`, attachment.title);
          formData.append(`description`, `${i + 1}---${type}---${j + 1}`);
          formData.append(`files`, attachment.file);
        }
      });
    }

    if (hasAttachments) {
      return this.http
        .post<{ data: Attachment[] }>(this.urlService.URLS.FILES, formData)
        .pipe(map((res) => (isArray(res.data) ? res.data : [res.data])));
    } else {
      return of(null);
    }
  }
}
