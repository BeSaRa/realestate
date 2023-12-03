import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { BannerComponent } from '@components/banner/banner.component';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { InquiriesComponent } from '@components/inquiries/inquiries.component';
import { InwaniComponent } from '@components/inwani/inwani.component';
import { NewsListComponent } from '@components/news-list/news-list.component';
import { NewsletterFormComponent } from '@components/newsletter-form/newsletter-form.component';
import { VotingFormComponent } from '@components/voting-form/voting-form.component';
import { DirectusClientService } from '@services/directus-client.service';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';

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
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export default class LandingPageComponent {
  newsService = inject(NewsService);
  service = inject(DirectusClientService);
  newsData = this.newsService.load({ limit: 4 });
  lang = inject(TranslationService);
}
