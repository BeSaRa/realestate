import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_PAGES_SECTIONS, NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { PaginatorLocal } from '@constants/paginator-local';
import { ConfigService } from '@services/config.service';
import { RECAPTCHA_LANGUAGE, RECAPTCHA_SETTINGS, RECAPTCHA_V3_SITE_KEY, RecaptchaSettings } from 'ng-recaptcha';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { routes } from './app.routes';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { PagesSections } from '@constants/pages-sections';
import { applicationInit } from './init/init';

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
    applicationInit,
    {
      provide: APP_PAGES_SECTIONS,
      useValue: PagesSections,
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
