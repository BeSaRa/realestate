import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NewsItemComponent } from '@components/news-item/news-item.component';
import { RelatedNewsListComponent } from '@components/related-news-list/related-news-list.component';
import { News } from '@models/news';
import { NewsService } from '@services/news.service';
import { Subject, debounceTime, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    NewsItemComponent,
  ],
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss'],
})
export class TopHeaderComponent implements OnInit, OnDestroy {
  search = new FormControl('', { nonNullable: true });

  news: News[] = [];
  filteredNews: News[] = [];

  destroy$: Subject<void> = new Subject<void>();

  newsService = inject(NewsService);

  ngOnInit(): void {
    this._listenToSearchChanges();
  }

  private _listenToSearchChanges() {
    this.search.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        tap((searchText) => {
          if (!searchText) this.filteredNews = [];
          else
            this.filteredNews = this.news.filter((newsItem) =>
              newsItem.title.toLowerCase().includes(searchText.toLowerCase())
            );
        })
      )
      .subscribe();
  }

  onFocus() {
    this.newsService
      .load()
      .pipe(
        takeUntil(this.destroy$),
        tap((news) => (this.news = news)),
        tap((news) => (this.filteredNews = news))
      )
      .subscribe();
  }

  toggleFilter() {
    document.documentElement.classList.toggle('root-filter');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
