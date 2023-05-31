import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { News } from '@models/news';
import { NewsService } from '@services/news.service';
import { catchError, of, tap } from 'rxjs';

export const newsItemResolver: ResolveFn<News> = (route, state) => {
  const router = inject(Router);

  return inject(NewsService)
    .loadById(route.paramMap.get('id') as unknown as number)
    .pipe(
      tap((newsItem) => {
        newsItem ?? router.navigate(['/news']);
      }),
      catchError((err) => {
        router.navigate(['/news']);
        return of();
      })
    );
};
