import { inject, Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { CastResponse } from 'cast-response';
import { Menus } from '@models/menus';
import { Menu } from '@models/menu';
import { MenuItem } from '@models/menu-item';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { ServiceContract } from '@contracts/service-contract';

@Injectable({
  providedIn: 'root',
})
export class MenuService extends RegisterServiceMixin(class {}) implements ServiceContract {
  serviceName = 'MenuService';
  http = inject(HttpClient);
  urlService = inject(UrlService);
  menus!: Menus;
  loading = false;
  menus$ = new ReplaySubject<Menus>(1);

  @CastResponse(() => Menus, {
    shape: {
      main_menu: () => Menu,
      'main_menu.links.*': () => MenuItem,
      'recent.*': () => MenuItem,
    },
  })
  private _loadMenus(): Observable<Menus> {
    this.loading = true;
    return this.http.get<Menus>(this.urlService.URLS.MAIN_MENU).pipe(tap(() => (this.loading = false)));
  }

  private _emitMenus(): Observable<Menus> {
    return this._loadMenus().pipe(tap((menus) => this.menus$.next(menus)));
  }

  private _waitIfThereIsLoadingInProgress(): Observable<Menus> {
    return this.loading ? this.menus$ : this._emitMenus();
  }

  loadMenus(): Observable<Menus> {
    return this.menus ? of(this.menus) : this._waitIfThereIsLoadingInProgress();
  }

  updateClicks(model: MenuItem): Observable<void> {
    return this.http.patch<void>(this.urlService.URLS.MENU_ITEMS + '/' + model.id, {
      clicks: Number(model.clicks) + 1,
    });
  }
}
