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
  urlService = inject(UrlService);
  client = createDirectus<DirectusSchemaContract>('http://192.168.52.5:8055/', {}).with(rest()).with(authentication('json', {credentials:'include'}));
}
