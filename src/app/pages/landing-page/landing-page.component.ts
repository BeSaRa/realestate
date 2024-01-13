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
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { DashboardService } from '@services/dashboard.service';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';

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
export default class LandingPageComponent extends OnDestroyMixin(class {}) {
  newsService = inject(NewsService);
  lang = inject(TranslationService);
  urlService = inject(UrlService);
  dashboardService = inject(DashboardService);

  sliderContent$ = this.dashboardService.loadHomeSliderData(this.urlService.URLS.HOME_SLIDER);

  newsData = this.newsService.load({ limit: 4 });
}
