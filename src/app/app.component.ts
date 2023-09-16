import { CommonModule, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { ChatGptComponent } from '@components/chat-gpt/chat-gpt.component';
import { FooterComponent } from '@components/footer/footer.component';
import { HeaderComponent } from '@components/header/header.component';
import { SideBarComponent } from '@components/side-bar/side-bar.component';
import { TranslationPopupComponent } from '@components/translation-popup/translation-popup.component';
import { SideBarDirection } from '@enums/side-bar-direction';
import { DialogService } from '@services/dialog.service';
import { SplashService } from '@services/splash.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import '@utils/prototypes/custom-prototypes';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatButtonModule,
    MatIconModule,
    ChatGptComponent,
    SideBarComponent,
    ButtonComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  lang = inject(TranslationService);
  stickyService = inject(StickyService);
  dialog = inject(DialogService);
  splashService = inject(SplashService);

  direction$ = this.lang.change$.pipe(
    startWith(this.lang.isLtr ? SideBarDirection.RIGHT : SideBarDirection.LEFT),
    map(() => (this.lang.isLtr ? SideBarDirection.RIGHT : SideBarDirection.LEFT))
  );

  links: { link: string; label: () => string }[] = [
    { link: '/home', label: () => this.lang.map.home },
    { link: '/sell-indicators', label: () => this.lang.map.sell_indicator },
    { link: '/mortgage-indicators', label: () => this.lang.map.mortgage_indicator },
    { link: '/rental-indicators', label: () => this.lang.map.rental_indicator },
    { link: '/ownership-indicators', label: () => this.lang.map.ownership_indicator },
    { link: '/news', label: () => this.lang.map.news },
    { link: '/about', label: () => this.lang.map.about_us },
    { link: '/laws', label: () => this.lang.map.laws_and_decisions },
  ];

  constructor() {
    registerLocaleData(localeAr, 'ar');
  }

  ngOnInit(): void {
    this.splashService.removeSplash();
  }

  @HostListener('window:scroll')
  windowScroll(): void {
    this.stickyService.isSticky.set(window.scrollY > 120);
  }
  @HostListener('window:keydown.control.alt.ش')
  @HostListener('window:keydown.control.alt.a')
  openTranslationPopup() {
    this.dialog.open(TranslationPopupComponent);
  }
}
