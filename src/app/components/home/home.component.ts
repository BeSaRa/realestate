import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from 'src/shared/components/top-bar/top-bar.component';
import { NavBarComponent } from 'src/shared/components/nav-bar/nav-bar.component';
import { HeroComponent } from 'src/shared/components/hero/hero.component';
import { ServicesSectionComponent } from 'src/shared/components/services-section/services-section.component';
import { NewsSectionComponent } from 'src/shared/components/news-section/news-section.component';
import { NewsLetterComponent } from 'src/shared/components/news-letter/news-letter.component';
import { PollComponent } from 'src/shared/components/poll/poll.component';
import { AddressInquiryComponent } from 'src/shared/components/address-inquiry/address-inquiry.component';
import { CadastralInquiryComponent } from 'src/shared/components/cadastral-inquiry/cadastral-inquiry.component';
import { FooterComponent } from 'src/shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    NavBarComponent,
    HeroComponent,
    ServicesSectionComponent,
    NewsSectionComponent,
    NewsLetterComponent,
    PollComponent,
    AddressInquiryComponent,
    CadastralInquiryComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
