import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { BannerComponent } from '@components/banner/banner.component';
import { ButtonComponent } from '@components/button/button.component';
import { InquiriesComponent } from '@components/inquiries/inquiries.component';
import { InwaniComponent } from '@components/inwani/inwani.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { NewsListComponent } from '@components/news-list/news-list.component';
import { NewsletterFormComponent } from '@components/newsletter-form/newsletter-form.component';
import { VotingFormComponent } from '@components/voting-form/voting-form.component';
import { APP_PAGES_SECTIONS } from '@constants/injection-tokens';
import { CriteriaContract } from '@contracts/criteria-contract';
import { SectionGuardDirective } from '@directives/section-guard.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { KpiRoot } from '@models/kpi-root';
import { DashboardService } from '@services/dashboard.service';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { formatNumber } from '@utils/utils';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BannerComponent,
    NewsletterFormComponent,
    VotingFormComponent,
    MatRadioModule,
    // SectionGuardDirective,
    // KpiRootComponent,
    InwaniComponent,
    InquiriesComponent,
    NewsListComponent,
    ButtonComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export default class LandingPageComponent extends OnDestroyMixin(class {}) {
  newsService = inject(NewsService);
  lang = inject(TranslationService);
  urlService = inject(UrlService);
  dashboardService = inject(DashboardService);
  pageSections = inject(APP_PAGES_SECTIONS);

  sliderContent$ = this.dashboardService.loadHomeSliderData(this.urlService.URLS.HOME_SLIDER);

  newsData = this.newsService.load({ limit: 3 });
  currentYear = new Date(Date.now()).getFullYear();

  criteria = {
    issueDateEndMonth: 12,
    issueDateStartMonth: 1,
    issueDateYear: this.currentYear,
    municipalityId: -1,
    propertyTypeList: [-1],
    purposeList: [-1],
    zoneId: -1,
    areaCode: -1,
  } as CriteriaContract;

  sellRootKPIS = [
    new KpiRoot().clone<KpiRoot>({
      id: 1,
      arName: this.lang.getArabicTranslation('the_total_number_of_sell_contracts'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_sell_contracts'),
      url: this.urlService.URLS.SELL_KPI1,
      purposeUrl: this.urlService.URLS.SELL_KPI2,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI3,
      chartDataUrl: this.urlService.URLS.SELL_KPI19,
      iconUrl: 'assets/icons/kpi/svg/7.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 4,
      arName: this.lang.getArabicTranslation('the_total_number_of_properties_units_sold'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_properties_units_sold'),
      url: this.urlService.URLS.SELL_KPI4,
      purposeUrl: this.urlService.URLS.SELL_KPI5,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI6,
      chartDataUrl: this.urlService.URLS.SELL_KPI20,
      iconUrl: 'assets/icons/kpi/svg/1.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 10,
      arName: this.lang.getArabicTranslation('total_sold_areas'),
      enName: this.lang.getEnglishTranslation('total_sold_areas'),
      url: this.urlService.URLS.SELL_KPI10,
      purposeUrl: this.urlService.URLS.SELL_KPI11,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI12,
      chartDataUrl: this.urlService.URLS.SELL_KPI22,
      iconUrl: 'assets/icons/kpi/svg/3.svg',
      hasSqUnit: true,
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 7,
      arName: this.lang.getArabicTranslation('the_total_value_of_sell_contracts'),
      enName: this.lang.getEnglishTranslation('the_total_value_of_sell_contracts'),
      url: this.urlService.URLS.SELL_KPI7,
      purposeUrl: this.urlService.URLS.SELL_KPI8,
      propertyTypeUrl: this.urlService.URLS.SELL_KPI9,
      chartDataUrl: this.urlService.URLS.SELL_KPI21,
      iconUrl: 'assets/icons/kpi/svg/6.svg',
      hasPrice: true,
    }),
  ];

  rentRootKPIS = [
    new KpiRoot().clone<KpiRoot>({
      id: 1,
      arName: this.lang.getArabicTranslation('the_total_number_of_lease_contracts'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_lease_contracts'),
      url: this.urlService.URLS.RENT_KPI1,
      purposeUrl: this.urlService.URLS.RENT_KPI2,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI3,
      chartDataUrl: this.urlService.URLS.RENT_KPI19,
      iconUrl: 'assets/icons/kpi/svg/8.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 4,
      arName: this.lang.getArabicTranslation('the_total_number_of_properties_units_rented'),
      enName: this.lang.getEnglishTranslation('the_total_number_of_properties_units_rented'),
      url: this.urlService.URLS.RENT_KPI4,
      purposeUrl: this.urlService.URLS.RENT_KPI5,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI6,
      chartDataUrl: this.urlService.URLS.RENT_KPI20,
      iconUrl: 'assets/icons/kpi/svg/1.svg',
    }),
    new KpiRoot().clone<KpiRoot>({
      id: 7,
      arName: this.lang.getArabicTranslation('the_total_value_of_lease_contracts'),
      enName: this.lang.getEnglishTranslation('the_total_value_of_lease_contracts'),
      url: this.urlService.URLS.RENT_KPI7,
      purposeUrl: this.urlService.URLS.RENT_KPI8,
      propertyTypeUrl: this.urlService.URLS.RENT_KPI9,
      chartDataUrl: this.urlService.URLS.RENT_KPI21,
      iconUrl: 'assets/icons/kpi/svg/4.svg',
      hasPrice: true,
    }),
  ];

  getSliderValue(value: number) {
    return formatNumber(value);
    // return _value.num + ' ' + (this.lang.isLtr ? _value.enSuffix : _value.arSuffix);
  }
}
