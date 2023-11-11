import { inject, Injectable } from '@angular/core';
import { ResponseTransformer, TransportOptions, TransportResult } from '@contracts/transport-option-contract';
import { TokenService } from './token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlService } from './url.service';
import { Observable, OperatorFunction, tap, map, BehaviorSubject, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestWrapperService {
  tokenService = inject(TokenService);
  http = inject(HttpClient);
  urlService = inject(UrlService);

  post<T>(
    path: string,
    data: Record<string, unknown>,
    options: TransportOptions = {}
  ): Observable<T & TransportResult> {
    let {
      // eslint-disable-next-line prefer-const
      noAuthorizationHeader = false,
      accessToken,
      // eslint-disable-next-line prefer-const
      params,
      // eslint-disable-next-line prefer-const
      mapResponse,
    } = options;

    if (accessToken === undefined) {
      // @ts-ignore
      accessToken = this.tokenService.getAccessToken();
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (!noAuthorizationHeader) {
      if (!accessToken) {
        throw new Error(`missing access token: ${accessToken}`);
      }
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const url = this.urlService.URLS.BASE_URL + path;

    const response = this.http
      .post<Response>(url, { headers: headers, params: params, body: JSON.stringify(data) })
      .pipe(
        map((res) => {
          if (!res.ok) {
            return this.failure<T>(res);
          }
          return this.success<T>(res, mapResponse);
        })
      );
    return response;
  }

  get<T>(path: string, options: TransportOptions = {}): Observable<T & TransportResult> {
    let {
      // eslint-disable-next-line prefer-const
      noAuthorizationHeader = false,
      accessToken,
      // eslint-disable-next-line prefer-const
      params,
      // eslint-disable-next-line prefer-const
      mapResponse,
    } = options;

    if (accessToken === undefined) {
      accessToken = this.tokenService.getAccessToken();
    }

    const headers = new HttpHeaders();

    if (!noAuthorizationHeader) {
      if (!accessToken) {
        throw new Error(`missing access token: ${accessToken}`);
      }
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const url = this.urlService.URLS.BASE_URL + path;

    const response = this.http.get<Response>(url, { headers, params }).pipe(
      map((res) => {
        if (!res.ok) {
          return this.failure<T>(res);
        }
        return this.success<T>(res, mapResponse);
      })
    );
    return response;
  }

  private failure<T>(res: Response): T & TransportResult {
    return {
      ok: false,
      msg: `${res.status} ${res.statusText}`,
    } as T & TransportResult;
  }

  private success<T>(res: Response, mapResponse: ResponseTransformer | undefined): T & TransportResult {
    if (res.status == 204) {
      return {
        ok: true,
        msg: `${res.status} ${res.statusText}`,
      } as T & TransportResult;
    }

    const data = from(res.json()).pipe(
      map((d) => {
        if (mapResponse) {
          return mapResponse(d);
        } else {
          return d.data;
        }
      })
    );

    return {
      ok: true,
      msg: `${res.status} ${res.statusText}`,
      ...data,
    } as unknown as T & TransportResult;
  }
}
