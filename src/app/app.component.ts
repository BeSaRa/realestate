import { CommonModule, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { ChatGptComponent } from '@components/chat-gpt/chat-gpt.component';
import { FooterComponent } from '@components/footer/footer.component';
import { HeaderComponent } from '@components/header/header.component';
import { TranslationPopupComponent } from '@components/translation-popup/translation-popup.component';
import { DialogService } from '@services/dialog.service';
import { SplashService } from '@services/splash.service';
import { StickyService } from '@services/sticky.service';
import '@utils/prototypes/custom-prototypes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatButtonModule,
    MatIconModule,
    ChatGptComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  stickyService = inject(StickyService);
  dialog = inject(DialogService);
  splashService = inject(SplashService);

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

  @HostListener('window:keydown.control.alt.a')
  openTranslationPopup() {
    this.dialog.open(TranslationPopupComponent);
  }
}
