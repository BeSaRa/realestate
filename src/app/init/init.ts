import { APP_INITIALIZER, Injector } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigService } from '@services/config.service';
import { UrlService } from '@services/url.service';
import { TranslationService } from '@services/translation.service';
import { LookupService } from '@services/lookup.service';
import { TokenService } from '@services/token.service';
import { UserService } from '@services/user.service';
import { AuthService } from '@services/auth.service';
import { SectionGuardService } from '@services/section-guard.service';
import { delay, forkJoin, of, switchMap, tap } from 'rxjs';
import { SplashService } from '@services/splash.service';
import { UnitsService } from '@services/units.service';
import { GoogleAnalyticsService } from '@services/google-analytics.service';
import { DistrictSortService } from '@services/district-sort.service';
import { MenuService } from '@services/menu.service';

export const applicationInit = [
  {
    provide: APP_INITIALIZER,
    useFactory: (registry: MatIconRegistry, domSanitizer: DomSanitizer) => {
      return () => registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi/mdi.svg'));
    },
    deps: [MatIconRegistry, DomSanitizer],
    multi: true,
  },
  {
    provide: APP_INITIALIZER,
    useFactory: (
      config: ConfigService,
      url: UrlService,
      translation: TranslationService,
      lookups: LookupService,
      tokenService: TokenService,
      userService: UserService,
      authService: AuthService,
      injector: Injector
    ) => {
      return () =>
        forkJoin([config.load()])
          .pipe(tap(() => url.setConfigService(config)))
          .pipe(tap(() => url.prepareUrls()))
          .pipe(switchMap(() => authService.getGuestToken()))
          .pipe(switchMap(() => lookups.load()))
          .pipe(switchMap(() => translation.load()))
          .pipe(tap(() => tokenService.getTokenFromStorage()))
          .pipe(tap(() => authService.refresh$.next('json')))
          .pipe(delay(0))
          .pipe(switchMap(() => (tokenService.getToken() ? userService.loadCurrentUserProfile() : of(true))))
          .pipe(switchMap(() => injector.get(MenuService).initLoad()))
          .pipe(switchMap(() => injector.get(SectionGuardService).load()));
    },
    deps: [
      ConfigService,
      UrlService,
      TranslationService,
      LookupService,
      TokenService,
      UserService,
      AuthService,
      Injector,
    ],
    multi: true,
  },
  {
    // UnitsService add to deps to initialize service at app start and be able to register it using ServiceRegister
    provide: APP_INITIALIZER,
    deps: [DistrictSortService, SplashService, UnitsService, GoogleAnalyticsService],
    useFactory: (districtSort: DistrictSortService) => () => districtSort.listenToRouteAndLangChange(),
    multi: true,
  },
];
