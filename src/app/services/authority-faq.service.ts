import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { AuthorityFaqContract } from '@contracts/authority-faq-contract';

@Injectable({
  providedIn: 'root',
})
export class AuthorityFaqService {
  private readonly _http = inject(HttpClient);
  private readonly _configService = inject(ConfigService);

  private readonly _url = `${this._configService.CONFIG.AUTHORITY_AI.BASE_URL}/FAQ/questions`;

  getFaq(n = 3) {
    return this._http.get<AuthorityFaqContract[]>(this._url, { params: { n } });
  }
}
