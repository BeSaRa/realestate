import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

declare const gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  router = inject(Router);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) gtag('config', 'G-BVL12S717E', { page_path: event.urlAfterRedirects });
    });
  }
}
