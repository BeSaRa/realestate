import { Injectable } from '@angular/core';
import { EndPoints, EndpointsType } from '@constants/endpoints';
import { ConfigService } from '@services/config.service';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private urls = EndPoints as EndpointsType;
  URLS: EndpointsType = {} as EndpointsType;
  config!: ConfigService;

  static hasTrailingSlash(url: string): boolean {
    return (url + '').lastIndexOf('/') === (url + '').length - 1;
  }

  static hasPrefixSlash(url: string): boolean {
    return (url + '').indexOf('/') === 0;
  }

  static removeTrailingSlash(url: string): string {
    return UrlService.hasTrailingSlash(url) ? (url + '').substring(0, (url + '').length - 1) : url;
  }

  static removePrefixSlash(url: string): string {
    return UrlService.hasPrefixSlash(url)
      ? UrlService.removePrefixSlash((url + '').substring(1, (url + '').length))
      : url;
  }

  public prepareUrls(): EndpointsType {
    this.URLS.BASE_URL = UrlService.removeTrailingSlash(this.config.BASE_URL);
    if (this.config.CONFIG.BE) {
      this.URLS.BE = this.addBaseUrl(this.config.CONFIG.BE);
      // console.log('TRUE');
    } else {
      // console.log('FALSE');
    }
    for (const key in this.urls) {
      if (
        key !== 'BASE_URL' &&
        Object.prototype.hasOwnProperty.call(this.urls, key) &&
        key !== 'BE' &&
        Object.prototype.hasOwnProperty.call(this.urls, key)
      ) {
        this.URLS[key as keyof EndpointsType] = this.addBaseUrl(this.urls[key as keyof EndpointsType]);
      }
    }
    // console.log(this.URLS);
    return this.URLS;
  }

  private addBaseUrl(url: string): string {
    const external = (this.config.CONFIG.EXTERNAL_PROTOCOLS ?? []).some((protocol) => {
      return url.toLowerCase().indexOf(protocol) === 0;
    });
    return external
      ? url
      : this.hasSpecificPrefix(url)
      ? this.applySpecificPrefix(url)
      : this.URLS.BASE_URL + '/' + UrlService.removePrefixSlash(url);
  }

  setConfigService(service: ConfigService): void {
    this.config = service;
  }

  hasSpecificPrefix(url: string): boolean {
    return url.split('|').length > 1;
  }

  applySpecificPrefix(url: string): string {
    const segments = url.split('|');
    return (
      UrlService.removeTrailingSlash(this.URLS[segments.shift() as keyof EndpointsType]) +
      '/' +
      UrlService.removePrefixSlash(segments.pop() || '')
    );
  }
}
