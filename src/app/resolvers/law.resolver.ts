import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Law } from '@models/law';
import { LawService } from '@services/law.service';
import { catchError, of, tap } from 'rxjs';

export const lawResolver: ResolveFn<Law> = (route) => {
  const router = inject(Router);

  return inject(LawService)
    .loadById(route.paramMap.get('id') as unknown as number)
    .pipe(
      tap((lawItem) => {
        lawItem ?? router.navigate(['/laws']);
      }),
      catchError(() => {
        router.navigate(['/laws']);
        return of();
      })
    );
};
