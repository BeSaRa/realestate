import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';
import { NewsListComponent } from 'src/app/components/news-list/news-list.component';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, NewsListComponent],
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.scss'],
})
export default class NewsPageComponent {
  newsService = inject(NewsService);
  newsData = this.newsService.load();

  lang = inject(TranslationService);
}
