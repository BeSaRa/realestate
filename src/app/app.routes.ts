import { Routes } from '@angular/router';
import { Pages } from '@enums/pages';
import { lawResolver } from '@resolvers/law.resolver';
import { newsItemResolver } from '@resolvers/news-item.resolver';
import { pageResolver } from '@resolvers/page.resolver';
import { authGuard } from '@guards/auth.guard';

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
    path: Pages.ABOUT_US,
    loadComponent: () => import('./pages/page/page.component'),
    data: { page: Pages.ABOUT_US },
    resolve: { pageData: pageResolver },
  },
  {
    path: Pages.CONTACT,
    loadComponent: () => import('./pages/page/page.component'),
    data: { page: Pages.CONTACT },
    resolve: { pageData: pageResolver },
  },
  {
    path: Pages.PRIVACY,
    loadComponent: () => import('./pages/page/page.component'),
    data: { page: Pages.PRIVACY },
    resolve: { pageData: pageResolver },
  },
  {
    path: Pages.DISCLAIMER,
    loadComponent: () => import('./pages/page/page.component'),
    data: { page: Pages.DISCLAIMER },
    resolve: { pageData: pageResolver },
  },
  {
    path: 'laws',
    loadComponent: () => import('./pages/law-page/law-page.component'),
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq-page/faq-page.component'),
  },
  {
    path: 'laws/:id',
    loadComponent: () => import('./pages/law-details-page/law-details-page.component'),
    resolve: { lawData: lawResolver },
  },
  {
    path: 'sell-indicators',
    canActivate: [authGuard('/sell-indicators')],
    loadComponent: () => import('@pages/sell-indicators-page/sell-indicators-page.component'),
  },
  {
    path: 'mortgage-indicators',
    canActivate: [authGuard('/mortgage-indicators')],
    loadComponent: () => import('@pages/mortgage-indicators/mortgage-indicators.component'),
  },
  {
    path: 'rental-indicators',
    canActivate: [authGuard('/rental-indicators')],
    loadComponent: () => import('@pages/rental-indicators-page/rental-indicators-page.component'),
  },
  {
    path: 'ownership-indicators',
    canActivate: [authGuard('/ownership-indicators')],
    loadComponent: () => import('@pages/ownership-indicators-page/ownership-indicators-page.component'),
  },
  {
    path: 'occupied-and-vacant-indicators',
    canActivate: [authGuard('/occupied-and-vacant-indicators')],
    loadComponent: () =>
      import('@pages/occupied-and-vacant-indicators-page/occupied-and-vacant-indicators-page.component'),
  },
  {
    path: 'forecasting-indicators',
    loadComponent: () => import('@pages/forecasting-indicators-page/forecasting-indicators-page.component'),
  },
  {
    path: 'inputs',
    loadComponent: () => import('@pages/inputs-page/inputs-page.component'),
  },
  {
    path: 'broker-indicators',
    loadComponent: () => import('@pages/broker-indicators-page/broker-indicators-page.component'),
  },
  {
    path: 'not-found',
    loadComponent: () => import('@pages/not-found-page/not-found-page.component'),
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
