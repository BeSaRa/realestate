import { Component, HostListener, inject } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { StickyService } from '@services/sticky.service';
import localeAr from '@angular/common/locales/ar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatGptComponent } from '@components/chat-gpt/chat-gpt.component';

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
export class AppComponent {
  stickyService = inject(StickyService);

  constructor() {
    registerLocaleData(localeAr, 'ar');
  }

  @HostListener('window:scroll')
  windowScroll(): void {
    this.stickyService.isSticky.set(window.scrollY > 120);
  }
}
