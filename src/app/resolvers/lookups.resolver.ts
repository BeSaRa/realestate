import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { LookupsMap } from '@models/lookups-map';
import { LookupService } from '@services/lookup.service';
import { SplashService } from '@services/splash.service';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';

export const lookupsResolver: (
  lookupsName: keyof LookupService,
  loadFnName: keyof LookupService
) => ResolveFn<boolean> = (lookupsName, loadFnName) => () => {
  const lookupService = inject(LookupService);
  const splashScreen = inject(SplashService);
  const router = inject(Router);

  if (lookupService[lookupsName]) return true;

  splashScreen.showSplash();

  return (lookupService[loadFnName] as unknown as () => Observable<LookupsMap>)().pipe(
    map(() => true),
    finalize(() => splashScreen.removeSplash()),
    catchError(() => {
      router.navigate(['/']);
      return of();
    })
  );
};
