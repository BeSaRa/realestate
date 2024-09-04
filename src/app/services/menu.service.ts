import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ServiceContract } from '@contracts/service-contract';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { Menu } from '@models/menu';
import { MenuItem } from '@models/menu-item';
import { Menus } from '@models/menus';
import { AuthService } from '@services/auth.service';
import { UrlService } from '@services/url.service';
import { UserService } from '@services/user.service';
import { CastResponse } from 'cast-response';
import { BehaviorSubject, delay, exhaustMap, map, Observable, ReplaySubject, Subject, tap } from 'rxjs';

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
  reload$ = new Subject<void>();
  menuMap$ = new BehaviorSubject<Record<string, MenuItem>>({});

  constructor() {
    super();
    this.listenToReload();
    this.listenToAuthenticationStatus();
    this.listenToMenuReload();
  }

  @CastResponse(() => Menus, {
    shape: {
      main_menu: () => Menu,
      'main_menu.links.*': () => MenuItem,
      footer_menu: () => Menu,
      'footer_menu.links.*': () => MenuItem,
      'recent.*': () => MenuItem,
    },
  })
  private _loadMenus(): Observable<Menus> {
    this.loading = true;
    return this.http.get<Menus>(this.urlService.URLS.MAIN_MENU).pipe(tap(() => (this.loading = false)));
  }

  private listenToReload(): void {
    this.reload$
      .pipe(exhaustMap(() => this._loadMenus()))
      .pipe(
        tap((filteredMenus) => {
          this.menus$.next(filteredMenus);
        })
      )
      .subscribe();
  }

  private _waitIfThereIsLoadingInProgress(): Observable<Menus> {
    this.reload$.next();
    return this.filteredMenus$;
  }

  initLoad() {
    return this._loadMenus().pipe(tap((menus) => this.menus$.next(menus)));
  }

  loadMenus(): Observable<Menus> {
    return this.menus ? this.filteredMenus$ : this._waitIfThereIsLoadingInProgress();
  }

  updateClicks(model: MenuItem): Observable<void> {
    return this.http.patch<void>(this.urlService.URLS.MENU_ITEMS + '/' + model.id, {
      clicks: Number(model.clicks) + 1,
    });
  }

  private userCanAccessLink(link: MenuItem): boolean {
    return (
      // if menu for public (means no authenticated user or role required to check )
      !link.is_authenticated ||
      // if menu related to only authenticated users then we have to check if user is authenticated or not
      (link.is_authenticated && !link.roles.length && this.authService.isAuthenticated()) ||
      // if user is Admin should see all menus
      !!(
        this.authService.isAuthenticated() &&
        this.userService.currentUser &&
        this.userService.currentUser &&
        this.userService.currentUser.role.admin_access
      ) ||
      // if menu related to at least one role then we have to check the current user role
      !!(
        link.roles &&
        link.roles.length &&
        this.authService.isAuthenticated() &&
        this.userService.currentUser &&
        this.userService.currentUser.role &&
        link.roles.includes(this.userService.currentUser.role.id)
      )
    );
  }

  private listenToAuthenticationStatus() {
    this.authService.authenticatedStatusChanged$
      .pipe(
        delay(100),
        tap(() => this.reload$.next())
      )
      .subscribe();
  }

  private listenToMenuReload() {
    this.menus$
      .pipe(
        map(this._filterMenu),
        tap((value) => {
          this.filteredMenus$.next(value);
        }),
        tap((menus) => {
          this.menuMap$.next(
            menus.main_menu.links.reduce((acc, item) => {
              return { ...acc, [item.url]: item };
            }, {})
          );
        })
      )
      .subscribe();
  }

  private _filterMenu = (menus: Menus) => {
    return {
      ...menus,
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
  };
}
