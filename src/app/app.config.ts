import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { forkJoin, switchMap, tap } from 'rxjs';
import { ConfigService } from '@services/config.service';
import { UrlService } from '@services/url.service';
import { DataService } from '@services/data.service';
import { TranslationService } from '@services/translation.service';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
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
        translation: TranslationService
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
            .pipe(switchMap(() => translation.load()));
      },
      deps: [ConfigService, UrlService, DataService, TranslationService],
      multi: true,
    },
  ],
};
