import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';
import { SurveyService } from '@services/survey.service';
import { DirectusClientService } from '@services/directus-client.service';
import { readItems } from '@directus/sdk';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ExtraHeaderComponent,
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
export default class LandingPageComponent implements OnInit {
  newsService = inject(NewsService);
  surveyService = inject(SurveyService);
  service = inject(DirectusClientService);

  newsData = this.newsService.load({ limit: 4 });

  lang = inject(TranslationService);

  async ngOnInit(): Promise<void> {
    const values = await this.service.client.request(
      readItems('surveys', {
        filter: {
          is_main: {},
        },
        fields: ['*', { choices: ['*'] }],
      })
    );
    console.log(values);
  }
}
