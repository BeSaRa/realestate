import { inject, Injectable } from '@angular/core';
import { authentication, createDirectus, DirectusClient, refresh, rest, RestClient } from '@directus/sdk';
import { DirectusSchemaContract } from '@contracts/directus-schema-contract';
import { d as AuthenticationClient } from '@directus/sdk/dist/login-93da9005';
import { ConfigService } from '@services/config.service';
import { delay, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DirectusClientService {
  client!: DirectusClient<DirectusSchemaContract> &
    RestClient<DirectusSchemaContract> &
    AuthenticationClient<DirectusSchemaContract>;
  config = inject(ConfigService);

  constructor() {
    of(true)
      .pipe(delay(0))
      .pipe(switchMap(() => this.config.baseUrlReady$))
      .subscribe((url) => {
        this.createDirectusClient(url);
      });
  }

  createDirectusClient(url: string): void {
    this.client = createDirectus<DirectusSchemaContract>(url, {})
      .with(rest())
      .with(authentication('json', { credentials: 'include' }));
  }
}
