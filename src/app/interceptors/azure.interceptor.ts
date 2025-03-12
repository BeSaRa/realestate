import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '@services/config.service';

export const azureInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(ConfigService);

  if (req.url.indexOf(config.CONFIG.AUTHORITY_AI.BASE_URL) >= 0) {
    req = req.clone({
      setHeaders: {
        'x-functions-key': config.CONFIG.AUTHORITY_AI.AZURE_X_FUNCTION_KEY,
        Authorization: `Bearer ${config.CONFIG.AUTHORITY_AI.PUBLIC_ACCESS_TOKEN}`,
      },
    });
  }
  return next(req);
};
