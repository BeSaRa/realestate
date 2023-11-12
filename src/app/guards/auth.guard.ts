import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CmsAuthenticationService } from '@services/auth.service';
import { switchMap, map } from 'rxjs/operators';
import { MenuService } from '@services/menu.service';
import { of, Observable } from 'rxjs';
import { UserInfo } from '@models/user-info';
import { MenuItem } from '@models/menu-item';

export const authGuard: (url: string, redirectTo?: string) => CanActivateFn = (url, redirectTo) => () => {
  const authService = inject(CmsAuthenticationService);
  const router = inject(Router);
  const menuService = inject(MenuService);

  return menuService.getMainMenuLinksObject().pipe(
    switchMap((linksObject) => {
      const menuItem = linksObject[url];
      if (!menuItem) {
        return of(true);
      }
      return authService.isLoggedIn().pipe(
        switchMap((isLoggedIn: boolean) => {
          if (isLoggedIn) {
            return authService.currentUser.pipe(
              map((user) => handleAuthenticatedUser(user, menuItem, redirectTo, router))
            );
          } else {
            return handleUnauthenticatedUser(redirectTo, router);
          }
        })
      );
    })
  );
};

function handleAuthenticatedUser(user: UserInfo | undefined, menuItem: MenuItem, redirectTo: string | undefined, router: Router): boolean {
  if (!user) {
    return false;
  }
  if (!menuItem.roles || menuItem.roles.length === 0 || (user.role && menuItem.roles.includes(user.role))) {
    return true;
  } else {
    if (redirectTo) {
      router.navigate([redirectTo]);
    }
    return false;
  }
}

function handleUnauthenticatedUser(redirectTo: string | undefined, router: Router): Observable<boolean> {
  if (redirectTo) {
    router.navigate([redirectTo]);
  }
  return of(false);
}

