import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { CastResponse } from 'cast-response';
import { Page } from '@models/page';
import { Pages } from '@enums/pages';

@Injectable({
  providedIn: 'root',
})
export class PageService {
  http = inject(HttpClient);
  urlService = inject(UrlService);

  @CastResponse(() => Page, { unwrap: 'data', fallback: '$default' })
  private loadPage(pageName: Pages): Observable<Page> {
    return this.http.get<Page>(this.urlService.URLS.BASE_URL + 'items/' + pageName);
  }

  loadAbout(): Observable<Page> {
    return this.loadPage(Pages.ABOUT_US);
  }
}
