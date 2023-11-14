import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { PaginatorLocal } from '@constants/paginator-local';
import { ConfigService } from '@services/config.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { RECAPTCHA_LANGUAGE, RECAPTCHA_SETTINGS, RECAPTCHA_V3_SITE_KEY, RecaptchaSettings } from 'ng-recaptcha';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { catchError, delay, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { routes } from './app.routes';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { UnitsService } from '@services/units.service';
import { TokenService } from '@services/token.service';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxMask(),
    importProvidersFrom(MatDialogModule),
    importProvidersFrom(MatSnackBarModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
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
        authService: AuthService
      ) => {
        return () =>
          forkJoin([config.load()])
            .pipe(tap(() => url.setConfigService(config)))
            .pipe(tap(() => url.prepareUrls()))
            .pipe(switchMap(() => lookups.load()))
            .pipe(switchMap(() => translation.load()))
            .pipe(tap(() => tokenService.getTokenFromStorage()))
            .pipe(tap(() => authService.refresh$.next('json')))
            .pipe(delay(0))
            .pipe(
              switchMap(() => {
                return tokenService.getToken() ? userService.loadCurrentUserProfile() : of(true);
              })
            );
      },
      // UnitsService add to deps to initialize service at app start and be able to regiser it using ServiceRegistery
      deps: [
        ConfigService,
        UrlService,
        TranslationService,
        LookupService,
        TokenService,
        UserService,
        AuthService,
        UnitsService,
      ],
      multi: true,
    },
    {
      provide: RECAPTCHA_SETTINGS,
      useFactory: (config: ConfigService) => {
        return {
          siteKey: config.CONFIG.RECAPTCHA.SITE_KEY,
        } as RecaptchaSettings;
      },
      deps: [ConfigService],
    },
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useFactory: (config: ConfigService) => config.CONFIG.RECAPTCHA.SITE_KEY,
      deps: [ConfigService],
    },
    {
      provide: RECAPTCHA_LANGUAGE,
      useFactory: (locale: string) => locale,
      deps: [LOCALE_ID],
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 2000,
        horizontalPosition: 'right',
      },
    },
    {
      provide: NGX_COUNTUP_OPTIONS,
      useValue: { enableScrollSpy: true, scrollSpyOnce: true },
    },
    {
      provide: MatPaginatorIntl,
      useClass: PaginatorLocal,
    },
    NgxMaskPipe,
  ],
};
