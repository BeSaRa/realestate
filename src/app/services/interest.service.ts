import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { map, Observable } from 'rxjs';
import { CastResponse } from 'cast-response';
import { InterestedType } from '@models/interested-type';
import { BudgetRange } from '@models/budget-range';
import { TranslationService } from '@services/translation.service';
import { CustomLookup } from '@models/custom-lookup';
import { InterestedDeveloper } from '@contracts/interested-developer';
import { InterestedInvestor } from '@contracts/interested-investor';
import { Attachment } from '@models/attachment';
import { DialogService } from '@services/dialog.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ViewAttachmentComponent } from '../popups/view-attachment/view-attachment.component';

@Injectable({
  providedIn: 'root',
})
export class InterestService {
  private readonly http = inject(HttpClient);
  private readonly urlService = inject(UrlService);
  private lang = inject(TranslationService);
  private dialog = inject(DialogService);
  types: CustomLookup[] = [
    new CustomLookup().clone<CustomLookup>({
      arName: this.lang.getArabicTranslation('villa'),
      enName: this.lang.getEnglishTranslation('villa'),
      value: 'vila',
    }),
    new CustomLookup().clone<CustomLookup>({
      arName: this.lang.getArabicTranslation('apartment'),
      enName: this.lang.getEnglishTranslation('apartment'),
      value: 'apartment',
    }),
    new CustomLookup().clone<CustomLookup>({
      arName: this.lang.getArabicTranslation('building'),
      enName: this.lang.getEnglishTranslation('building'),
      value: 'building',
    }),
    new CustomLookup().clone<CustomLookup>({
      arName: this.lang.getArabicTranslation('land'),
      enName: this.lang.getEnglishTranslation('land'),
      value: 'land',
    }),
  ];

  investmentTypes: CustomLookup[] = [
    new CustomLookup().clone<CustomLookup>({
      arName: this.lang.getArabicTranslation('residence'),
      enName: this.lang.getEnglishTranslation('residence'),
      value: 'residence',
    }),
    new CustomLookup().clone<CustomLookup>({
      arName: this.lang.getArabicTranslation('investment'),
      enName: this.lang.getEnglishTranslation('investment'),
      value: 'investment',
    }),
  ];

  @CastResponse(() => InterestedType, {
    unwrap: 'data',
  })
  private _loadInterestTypes(): Observable<InterestedType[]> {
    return this.http.get<InterestedType[]>(this.urlService.URLS.INTEREST_TYPES);
  }

  loadInterestTypes(): Observable<InterestedType[]> {
    return this._loadInterestTypes();
  }

  @CastResponse(() => BudgetRange, {
    unwrap: 'data',
  })
  private _loadBudgetRange(): Observable<BudgetRange[]> {
    return this.http.get<BudgetRange[]>(this.urlService.URLS.BUDGET_RANGE);
  }

  loadBudgetRange(): Observable<BudgetRange[]> {
    return this._loadBudgetRange();
  }

  saveInterest(
    model: Partial<InterestedDeveloper> | Partial<InterestedInvestor>
  ): Observable<InterestedInvestor | InterestedDeveloper> {
    return this.http.post<InterestedInvestor | InterestedDeveloper>(this.urlService.URLS.INTEREST_REQUEST, model);
  }

  attacheFilesToInterest(model: Partial<InterestedDeveloper> | Partial<InterestedInvestor>, files: Attachment[]) {
    return this.http.post(this.urlService.URLS.INTEREST_ATTACHMENTS, {
      type: model.type,
      id: model.id,
      attachments: files.map((file: Attachment) => {
        return {
          directus_files_id: file.id,
          ...(model.type === 'DEVELOPER'
            ? { interested_developers_id: model.id }
            : { interested_investors_id: model.id }),
        };
      }),
    });
  }

  @CastResponse(() => Attachment, { unwrap: 'data' })
  private _uploadFilesToAttachmentsFolder(files: Attachment[]): Observable<Attachment[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`folder`, file.folder!);
      formData.append(`title`, file.title);
      formData.append(`file`, file.file);
    });
    return this.http.post<Attachment[]>(this.urlService.URLS.FILES, formData);
  }

  uploadFilesToAttachmentsFolder(files: Attachment[]): Observable<Attachment[]> {
    return this._uploadFilesToAttachmentsFolder(files).pipe(map((result) => ([] as Attachment[]).concat(result)));
  }

  deleteFile(fileIds: string[]): Observable<unknown> {
    return this.http.request('DELETE', this.urlService.URLS.FILES, {
      body: fileIds,
    });
  }

  viewAttachment(attachment: Attachment): MatDialogRef<ViewAttachmentComponent> {
    return this.dialog.open(ViewAttachmentComponent, {
      data: {
        model: attachment,
      },
    });
  }
}
