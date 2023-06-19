import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ExtraHeaderComponent } from 'src/app/components/extra-header/extra-header.component';
import { MatButtonModule } from '@angular/material/button';
import { NewsListComponent } from 'src/app/components/news-list/news-list.component';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderComponent, NgOptimizedImage, MatButtonModule, NewsListComponent],
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.scss'],
})
export default class NewsPageComponent {
  newsService = inject(NewsService);
  newsData = this.newsService.load();

  lang = inject(TranslationService);
}
