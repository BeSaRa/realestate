import { CmsService } from '@abstracts/cms.service';
import { Injectable } from '@angular/core';
import { Attachment } from '@models/attachment';
import { CurrentProjectAttachments, CurrentProjectData, DeveloperRegistration } from '@models/developer-registration';
import { isArray } from '@utils/utils';
import { CastResponse } from 'cast-response';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeveloperRegistrationService extends CmsService<DeveloperRegistration> {
  serviceName = 'DeveloperRegistrationService';
  collectionName = 'real_estate_developers';

  @CastResponse(undefined, { unwrap: 'data', fallback: '$default' })
  checkDeveloperName(developer_name: string) {
    return this.http.get<DeveloperRegistration[]>(this.urlService.URLS.BASE_URL + '/items/' + this.collectionName, {
      params: {
        'filter[companyName][_eq]': developer_name,
      },
    });
  }

  registerCurrentProject(project: CurrentProjectData) {
    return this.http.post(this.urlService.URLS.BASE_URL + '/items/qatar_current_projects', project);
  }

  uploadFiles(attachments: CurrentProjectAttachments): Observable<null | Attachment[]> {
    let hasAttachments = false;
    const formData = new FormData();
    Object.keys(attachments).forEach((type) => {
      for (let j = 0; j < attachments[type as keyof Omit<CurrentProjectAttachments, 'clone'>].length; j++) {
        hasAttachments = true;
        const attachment = attachments[type as keyof Omit<CurrentProjectAttachments, 'clone'>][j];
        formData.append(`folder`, attachment.folder!);
        formData.append(`title`, attachment.title);
        formData.append(`description`, `${type}---${j + 1}`);
        formData.append(`files`, attachment.file);
      }
    });

    if (hasAttachments) {
      return this.http
        .post<{ data: Attachment[] }>(this.urlService.URLS.FILES, formData)
        .pipe(map((res) => (isArray(res.data) ? res.data : [res.data])));
    } else {
      return of(null);
    }
  }
}
