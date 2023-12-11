import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { BannerComponent } from '@components/banner/banner.component';
import { ButtonComponent } from '@components/button/button.component';
import { InquiriesComponent } from '@components/inquiries/inquiries.component';
import { InwaniComponent } from '@components/inwani/inwani.component';
import { NewsListComponent } from '@components/news-list/news-list.component';
import { NewsletterFormComponent } from '@components/newsletter-form/newsletter-form.component';
import { SliderComponent, SliderTemplateDirective } from '@components/slider/slider.component';
import { VotingFormComponent } from '@components/voting-form/voting-form.component';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { HomeSlider } from '@models/home-slider';
import { DirectusClientService } from '@services/directus-client.service';
import { HomeSliderService } from '@services/home-slider.service';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';
import { map, Observable } from 'rxjs';
import { chunks } from '@utils/utils';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgOptimizedImage,
    ButtonComponent,
    BannerComponent,
    NewsListComponent,
    NewsletterFormComponent,
    VotingFormComponent,
    MatRadioModule,
    InquiriesComponent,
    InwaniComponent,
    ExtraHeaderPortalBridgeDirective,
    SliderComponent,
    SliderTemplateDirective,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export default class LandingPageComponent {
  newsService = inject(NewsService);
  service = inject(DirectusClientService);
  newsData = this.newsService.load({ limit: 4 });
  lang = inject(TranslationService);
  homeSliderService = inject(HomeSliderService);

  homeSliderContent$: Observable<HomeSlider[][]> = this.homeSliderService.load().pipe(
    map((data) => data.map((item) => new HomeSlider().clone<HomeSlider>(item))),
    map((slides) => [...chunks(slides, 2)])
  );
}
