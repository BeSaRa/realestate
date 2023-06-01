import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { forkJoin, tap } from 'rxjs';
import { ConfigService } from '@services/config.service';
import { UrlService } from '@services/url.service';
import { DataService } from '@services/data.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (config: ConfigService, url: UrlService, dataService: DataService) => {
        return () =>
          forkJoin([
            config.load(),
            dataService.loadKPIPricePerSqrf(),
            dataService.loadKPIAvgUnitPrice(),
            dataService.loadKPISellCount(),
          ])
            .pipe(tap(() => url.setConfigService(config)))
            .pipe(tap(([, kpis]) => dataService.prepareYearsAndMunicipalities(kpis)))
            .pipe(tap(() => url.prepareUrls()));
      },
      deps: [ConfigService, UrlService, DataService],
      multi: true,
    },
  ],
};
