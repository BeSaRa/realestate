import { CanActivateFn } from '@angular/router';

export const authGuard: (url: string, redirectTo?: string) => CanActivateFn = (url, redirectTo) => () => {
  // return menuService.getMainMenuLinksObject().pipe(
  //   switchMap((linksObject) => {
  //     const menuItem = linksObject[url];
  //     if (!menuItem) {
  //       return of(true);
  //     }
  //     return authService.isLoggedIn().pipe(
  //       switchMap((isLoggedIn: boolean) => {
  //         if (isLoggedIn) {
  //           return authService.currentUser.pipe(
  //             map((user) => handleAuthenticatedUser(user, menuItem, redirectTo, router))
  //           );
  //         } else {
  //           return handleUnauthenticatedUser(redirectTo, router);
  //         }
  //       })
  //     );
  //   })
  // );
  return true;
};
