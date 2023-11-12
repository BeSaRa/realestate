import { inject, Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, tap, switchMap, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { CastResponse } from 'cast-response';
import { Menus } from '@models/menus';
import { Menu } from '@models/menu';
import { MenuItem } from '@models/menu-item';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { ServiceContract } from '@contracts/service-contract';
import { CmsAuthenticationService } from './auth.service';
import { UserInfo } from '@models/user-info';

@Injectable({
  providedIn: 'root',
})
export class MenuService extends RegisterServiceMixin(class { }) implements ServiceContract {
  serviceName = 'MenuService';
  http = inject(HttpClient);
  urlService = inject(UrlService);
  authService = inject(CmsAuthenticationService);
  menus!: Menus;
  mainMenuLinksObject!: Record<string, MenuItem>;
  mainMenuLinksObject$ = new ReplaySubject<Record<string, MenuItem>>(1);
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

  filterMenuItemsByRole(menus: Menus): Observable<Menus> {
    return this.authService.currentUser.pipe(
      switchMap((currentUser) => {
        const isAuthenticated = !!currentUser;
        const filteredMenuItems = menus.main_menu.links.filter((menuItem) =>
          this.isMenuItemAccessible(menuItem, isAuthenticated, currentUser)
        );
        const filteredMenus: Menus = { ...menus, main_menu: { ...menus.main_menu, links: filteredMenuItems } };
        return of(filteredMenus);
      })
    );
  }
  
  private isMenuItemAccessible(menuItem: MenuItem, isAuthenticated: boolean, currentUser: UserInfo | undefined): boolean {
    if (!isAuthenticated && menuItem.is_authenticated) {
      return true;
    }
    if (!menuItem.roles || menuItem.roles.length === 0) {
      return true;
    }
    return isAuthenticated && menuItem.roles.some((role) => currentUser?.role === role);
  }

  private _emitMenus(): Observable<Menus> {
    let originalMenus: Menus;
  
    return this._loadMenus().pipe(
      tap((menus) => {
        originalMenus = menus;
      }),
      switchMap((menus) => this.filterMenuItemsByRole(menus)),
      tap((filteredMenus) => {
        this.menus$.next(filteredMenus); // use filtered menu to show in the nave bar
        // Use the original menus for the links object (to be used in the route)
        this.mainMenuLinksObject = this.createMainMenuLinksObject(originalMenus); 
        this.mainMenuLinksObject$.next(this.mainMenuLinksObject);
      })
    );
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

  getMainMenuLinksObject(): Observable<Record<string, MenuItem>> {
    if (!this.mainMenuLinksObject) {
      // menu is not loaded yet, so load it
      this._emitMenus();
    }
    return this.mainMenuLinksObject$.asObservable();
  }

  private createMainMenuLinksObject(menus: Menus): Record<string, MenuItem> {
    return menus?.main_menu?.links?.reduce((acc, link) => {
      return { ...acc, [link.url]: link };
    }, {});
  }
}
