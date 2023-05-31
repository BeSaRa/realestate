import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { StickyService } from '@services/sticky.service';
import { NewsService } from '@services/news.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  stickyService = inject(StickyService);
  newsService = inject(NewsService);

  constructor() {
    this.newsService.load().subscribe((list) => {
      console.log(list);
    });
    this.newsService.loadById(1).subscribe((one) => {
      console.log(one);
    });
  }

  @HostListener('window:scroll')
  windowScroll(): void {
    this.stickyService.isSticky.set(window.scrollY > 120);
  }
}
