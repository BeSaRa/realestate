import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Page } from '@models/page';
import { PageService } from '@services/page.service';
import { catchError, of, tap } from 'rxjs';

export const pageResolver: ResolveFn<Page> = (route, state) => {
  const router = inject(Router);

  return inject(PageService)
    .loadPage(route.data['page'])
    .pipe(
      tap((pageData) => {
        pageData ?? router.navigate(['/']);
      }),
      catchError((err) => {
        router.navigate(['/']);
        return of();
      })
    );
};
