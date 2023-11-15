import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MenuService } from '@services/menu.service';
import { map } from 'rxjs';

export const authGuard: (url: string, redirectTo?: string) => CanActivateFn =
  (url, redirectTo = '/home') =>
  () => {
    const menuService = inject(MenuService);
    const router = inject(Router);
    return menuService.menuMap$.pipe(
      map((menus) => {
        return Object.prototype.hasOwnProperty.call(menus, url) ? true : router.parseUrl(redirectTo);
        // return !Object.prototype.hasOwnProperty.call(menus, url)
        //   ? true
        //   : (() => {
        //       const menu = menus[url];
        //       let hasAccess: boolean;
        //       if (menu.roles.length) {
        //         hasAccess = !!(
        //           authService.isAuthenticated() &&
        //           userService.currentUser &&
        //           userService.currentUser.role &&
        //           menu.roles.includes(userService.currentUser.role.id)
        //         );
        //       } else if (menu.is_authenticated) {
        //         hasAccess = authService.isAuthenticated();
        //       } else {
        //         hasAccess = true;
        //       }
        //       return hasAccess ? hasAccess : router.parseUrl(redirectTo);
        //     })();
      })
    );
  };
