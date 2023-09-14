import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, IconButtonComponent],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
  lang = inject(TranslationService);
  sticky = inject(StickyService);

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

  changeLang(event: Event) {
    event.preventDefault();
    this.lang.toggleLang();
  }
}
