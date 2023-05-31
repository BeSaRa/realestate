import { Routes } from '@angular/router';
import { Pages } from '@enums/pages';
import { newsItemResolver } from '@resolvers/news-item.resolver';
import { pageResolver } from '@resolvers/page.resolver';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadComponent: () => import('./pages/landing-page/landing-page.component') },
  {
    path: 'news',
    loadComponent: () => import('./pages/news-page/news-page.component'),
  },
  {
    path: 'news/:id',
    loadComponent: () => import('./pages/news-item-details-page/news-item-details-page.component'),
    resolve: { newsItemData: newsItemResolver },
  },
  {
    path: 'about-us',
    loadComponent: () => import('./pages/page/page.component'),
    data: { page: Pages.ABOUT_US },
    resolve: { pageData: pageResolver },
  },
];
