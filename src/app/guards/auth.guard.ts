import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CmsAuthenticationService } from '@services/auth.service';
import { tap } from 'rxjs';

export const authGuard: (redirectTo?: string) => CanActivateFn = (redirectTo) => () => {
  const authService = inject(CmsAuthenticationService);
  const router = inject(Router);
  return authService.isLoggedIn().pipe(
    tap((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        return true;
      } else {
        return !redirectTo ? false : router.navigate([redirectTo]);
      }
    })
  );
};
