import { inject, Injectable } from '@angular/core';
import { map, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { CastResponse } from 'cast-response';
import { Menus } from '@models/menus';
import { Menu } from '@models/menu';
import { MenuItem } from '@models/menu-item';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { ServiceContract } from '@contracts/service-contract';
import { UserService } from '@services/user.service';
import { AuthService } from '@services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService extends RegisterServiceMixin(class {}) implements ServiceContract {
  serviceName = 'MenuService';
  http = inject(HttpClient);
  urlService = inject(UrlService);
  userService = inject(UserService);
  authService = inject(AuthService);
  menus!: Menus;
  loading = false;
  menus$ = new ReplaySubject<Menus>(1);
  filteredMenus$ = new ReplaySubject<Menus>(1);

  private filteredMenuSubscription = this.menus$
    .pipe(
      map((menus) => {
        return {
          main_menu: {
            ...menus.main_menu,
            links: [
              ...menus.main_menu.links.filter((link) => {
                return this.userCanAccessLink(link);
              }),
            ],
          },
          recent: [...menus.recent.filter((link) => this.userCanAccessLink(link))],
        };
      }),
      tap((value) => this.filteredMenus$.next(value))
    )
    .subscribe();

  constructor() {
    super();
    this.listenToAuthenticationStatus();
  }

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
    return this._loadMenus().pipe(
      tap((filteredMenus) => {
        this.menus$.next(filteredMenus);
      })
    );
  }

  private _waitIfThereIsLoadingInProgress(): Observable<Menus> {
    Promise.resolve().then(() => (this.loading ? this._emitMenus() : null));
    return this.filteredMenus$;
  }

  loadMenus(): Observable<Menus> {
    return this.menus ? of(this.menus) : this._waitIfThereIsLoadingInProgress();
  }

  updateClicks(model: MenuItem): Observable<void> {
    return this.http.patch<void>(this.urlService.URLS.MENU_ITEMS + '/' + model.id, {
      clicks: Number(model.clicks) + 1,
    });
  }

  private userCanAccessLink(link: MenuItem): boolean {
    return (
      // if user is Admin should see all menus later we will do it
      // (this.authService.isAuthenticated() && this.userService.currentUser && this.userService.currentUser)
      // if menu related to at least one role then we have to check the current user role
      !!(
        link.roles &&
        link.roles.length &&
        this.authService.isAuthenticated() &&
        this.userService.currentUser &&
        this.userService.currentUser.role &&
        link.roles.includes(this.userService.currentUser.role)
      ) ||
      // if menu related to only authenticated users then we have to check if user is authenticated or not
      (link.is_authenticated && this.authService.isAuthenticated()) ||
      // if menu for public (means no authenticated user or role required to check )
      !link.is_authenticated
    );
  }

  private listenToAuthenticationStatus() {
    this.authService.authenticatedStatusChanged$.pipe(switchMap(() => this._emitMenus())).subscribe();
  }
}
