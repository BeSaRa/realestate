import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from '@services/url.service';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  http = inject(HttpClient);
  urlService = inject(UrlService);
  load(): Observable<void> {
    return this.http.get<void>(this.urlService.URLS.TRANSLATION);
  }
}
