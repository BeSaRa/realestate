import { inject, Injectable } from '@angular/core';
import { createDirectus, rest, authentication, AuthenticationConfig } from '@directus/sdk';
import { ConfigService } from '@services/config.service';
import { DirectusSchemaContract } from '@contracts/directus-schema-contract';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root',
})
export class DirectusClientService {
  config = inject(ConfigService);
  client = createDirectus<DirectusSchemaContract>(this.config.BASE_URL, {}).with(rest()).with(authentication('json', {credentials:'include'}));
}
