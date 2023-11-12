import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CmsAuthenticationService } from '@services/auth.service';
import { switchMap, tap } from 'rxjs/operators';
import { MenuService } from '@services/menu.service';
import { of } from 'rxjs';

export const authGuard: (url: string, redirectTo?: string) => CanActivateFn = (url, redirectTo) => () => {
  const authService = inject(CmsAuthenticationService);
  const router = inject(Router);
  const menuService = inject(MenuService);

  return menuService.getMainMenuLinksObject().pipe(
    switchMap((linksObject) => {
      const menuItem = linksObject[url];

      if (!menuItem || !menuItem.is_authenticated) {
        // No menu item found or authentication not required, allow access
        return of(true);
      } else {
        // Authentication is required for the current URL
        return authService.isLoggedIn().pipe(
          tap((isLoggedIn: boolean) => {
            if (isLoggedIn) {
              return true;
            } else {
              return !redirectTo ? false : router.navigate([redirectTo]);
            }
          })
        );
      }
    })
  );
};
