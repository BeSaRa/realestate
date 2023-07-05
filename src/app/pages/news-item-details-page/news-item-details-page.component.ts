import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { RelatedNewsListComponent } from '@components/related-news-list/related-news-list.component';
import { News } from '@models/news';
import { SafeHtmlPipe } from '@pipes/safe-html.pipe';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';
import { Subject, map, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-news-item-details-page',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ExtraHeaderComponent,
    SafeHtmlPipe,
    MatButtonModule,
    RelatedNewsListComponent,
  ],
  templateUrl: './news-item-details-page.component.html',
  styleUrls: ['./news-item-details-page.component.scss'],
})
export default class NewsItemDetailsPageComponent implements OnInit, OnDestroy {
  @Input() newsItemData!: News;

  route = inject(ActivatedRoute);

  newsService = inject(NewsService);
  relatedNews: News[] = [];

  lang = inject(TranslationService);

  destroy$: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((_) => this._loadRelatedNews())
      )
      .subscribe();
  }

  private _loadRelatedNews() {
    return this.newsService.load().pipe(
      map((items) => items ?? []),
      map((items) => items.filter((item) => item.id !== this.newsItemData.id)),
      map((items) => items.slice(0, 3)),
      tap((newsData) => (this.relatedNews = newsData))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
