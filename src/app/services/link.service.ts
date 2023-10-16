import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UrlService } from './url.service';
import { HttpClient } from '@angular/common/http';
import { Link } from '@models/link.model';
import { TranslationService } from './translation.service';

@Injectable({
    providedIn: 'root',
})
export class LinkService {
    urlService = inject(UrlService);
    http = inject(HttpClient);
    lang = inject(TranslationService);
    links: Link[] = [
        { label: () => this.lang.map.home, url: '/home', authRequired: false  },
        { label: () => this.lang.map.sell_indicator, url: '/sell-indicators', authRequired: false },
        { label: () => this.lang.map.mortgage_indicator, url: '/mortgage-indicators', authRequired: false },
        { label: () => this.lang.map.rental_indicator, url: '/rental-indicators', authRequired: false },
        { label: () => this.lang.map.ownership_indicator, url: '/ownership-indicators', authRequired: true },
        { label: () => this.lang.map.news, url: '/news', authRequired: false},
        { label: () => this.lang.map.about_us, url: '/about', authRequired: false },
        { label: () => this.lang.map.laws_and_decisions, url: '/laws', authRequired: false },
      ];;
    getLinks(): Observable<Link[]> {
        //ToDo (Mousa): return this.http.get<Link[]>(this.urlService.URLS.MENU_LINKS); 
        /* for now we just provide the hard coded ones till the liks api (cms) is ready */
        return of(this.links);

    }
}