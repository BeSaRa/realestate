import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ConfigService } from '@services/config.service';
import { DataService } from '@services/data.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { forkJoin, switchMap, tap } from 'rxjs';
import { routes } from './app.routes';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorLocal } from '@constants/paginator-local';
import { LookupService } from '@services/lookup.service';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxMask(),
    importProvidersFrom(MatDialogModule),
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
        dataService: DataService,
        translation: TranslationService,
        lookups: LookupService
      ) => {
        return () =>
          forkJoin([
            config.load(),
            dataService.loadCategories(),
            dataService.loadMunicipalities(),
            dataService.loadKPIPricePerSqrf(),
            dataService.loadKPIAvgUnitPrice(),
            dataService.loadKPISellCount(),
            dataService.loadKPIMortCount(),
            dataService.loadKPIMortValue(),
            dataService.loadKPIMortVsSellCount(),
            dataService.loadKPIMortVsSellValue(),
          ])
            .pipe(tap(() => url.setConfigService(config)))
            .pipe(tap(() => url.prepareUrls()))
            .pipe(switchMap(() => lookups.load()))
            .pipe(switchMap(() => translation.load()));
      },
      deps: [ConfigService, UrlService, DataService, TranslationService, LookupService],
      multi: true,
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
