import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { News } from '@models/news';
import { SafeHtmlPipe } from '@pipes/safe-html.pipe';
import { NewsService } from '@services/news.service';
import { Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-news-item-details-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ExtraHeaderComponent, SafeHtmlPipe, MatButtonModule],
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
