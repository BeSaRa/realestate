import { inject, Injector, provideAppInitializer } from '@angular/core';
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
  provideAppInitializer(() => {
    const initializerFn = ((registry: MatIconRegistry, domSanitizer: DomSanitizer) => () => {
      registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi/mdi.svg'));
    })(inject(MatIconRegistry), inject(DomSanitizer));
    return initializerFn();
  }),
  provideAppInitializer(() => {
    const initializerFn = ((
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
          // .pipe(tap(() => tokenService.getTokenFromStorage()))
          .pipe(tap(() => authService.refresh('cookie')))
          .pipe(switchMap(() => (tokenService.getToken() ? userService.loadCurrentUserProfile() : of(true))))
          .pipe(switchMap(() => injector.get(MenuService).initLoad()))
          .pipe(switchMap(() => injector.get(SectionGuardService).load()));
    })(
      inject(ConfigService),
      inject(UrlService),
      inject(TranslationService),
      inject(LookupService),
      inject(TokenService),
      inject(UserService),
      inject(AuthService),
      inject(Injector)
    );
    return initializerFn();
  }),
  provideAppInitializer(() => {
    const initializerFn = (
      (
        districtSort: DistrictSortService,
        // those are only to be injected at app initialization
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: SplashService,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ___: UnitsService,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ____: GoogleAnalyticsService
      ) =>
      () =>
        districtSort.listenToRouteAndLangChange()
    )(inject(DistrictSortService), inject(SplashService), inject(UnitsService), inject(GoogleAnalyticsService));
    return initializerFn();
  }),
];
