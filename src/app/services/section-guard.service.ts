import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ColumnGuard } from '@models/column-guard';
import { PageSections } from '@models/page-sections';
import { SectionGuard } from '@models/section-guard';
import { UrlService } from '@services/url.service';
import { CastResponse } from 'cast-response';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SectionGuardService {
  urlService = inject(UrlService);
  http = inject(HttpClient);
  router = inject(Router);

  private _pagesSectionsGuards: Record<string, PageSections> = {};
  private _currentPageUrl = '';

  get currentPageSectionsGuards() {
    return this._pagesSectionsGuards[this._currentPageUrl] ?? undefined;
  }

  constructor() {
    this._listenToRouteChange();
  }

  @CastResponse(undefined, { unwrap: 'data' })
  private _load(): Observable<Record<string, PageSections>> {
    return this.http.get<Record<string, PageSections>>(this.urlService.URLS.SECURITY);
  }

  load(): Observable<Record<string, PageSections>> {
    return this._load()
      .pipe(
        map((res) => {
          Object.keys(res).forEach((page) => {
            res[page] = new PageSections().clone<PageSections>(res[page]);
            Object.keys(res[page].sections).forEach((section) => {
              res[page].sections[section] = new SectionGuard().clone<SectionGuard>(res[page].sections[section]);
              Object.keys(res[page].sections[section].columns).forEach((column) => {
                res[page].sections[section].columns[column] = new ColumnGuard().clone<ColumnGuard>(
                  res[page].sections[section].columns[column]
                );
              });
            });
          });

          return res;
        })
      )
      .pipe(tap((pages) => (this._pagesSectionsGuards = pages)));
  }

  isSectionHidden(sectionName: string) {
    return this.currentPageSectionsGuards ? this.currentPageSectionsGuards.isSectionHidden(sectionName) : false;
  }

  private _listenToRouteChange() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._currentPageUrl = event.url;
        // console.log(this.isSectionHidden('root-kpis'));
      }
    });
  }
}
