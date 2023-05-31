import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { NewsService } from '@services/news.service';
import { News } from '@models/news';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { SafeHtmlPipe } from '@pipes/safe-html.pipe';

@Component({
  selector: 'app-news-item-details-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ExtraHeaderComponent, SafeHtmlPipe],
  templateUrl: './news-item-details-page.component.html',
  styleUrls: ['./news-item-details-page.component.scss'],
})
export default class NewsItemDetailsPageComponent implements OnInit, OnDestroy {
  @Input() id!: number;

  newsItemData?: News;
  newsService = inject(NewsService);

  private _destroy$: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.newsService
      .loadById(this.id)
      .pipe(takeUntil(this._destroy$), tap(console.log))
      .subscribe((newsItem) => (this.newsItemData = newsItem));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._destroy$.unsubscribe();
  }
}
