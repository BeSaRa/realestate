import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { NewsItemComponent } from '@components/news-item/news-item.component';
import { News } from '@models/news';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';
import { Subject, debounceTime, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatAutocompleteModule,
    NewsItemComponent,
    ButtonComponent,
    IconButtonComponent,
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
  lang = inject(TranslationService);

  ngOnInit(): void {
    this._listenToSearchChanges();
    this.onFocus(true);
  }

  private _listenToSearchChanges() {
    this.search.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        tap((searchText) => {
          if (!searchText) this.filteredNews = this.news;
          else
            this.filteredNews = this.news.filter((newsItem) =>
              newsItem.title.toLowerCase().includes(searchText.toLowerCase())
            );
        })
      )
      .subscribe();
  }

  onFocus(isInit = false) {
    this.newsService
      .load()
      .pipe(
        takeUntil(this.destroy$),
        tap((news) => (this.news = news)),
        tap((news) => {
          if (isInit) this.filteredNews = news;
        })
      )
      .subscribe();
  }

  toggleFilter() {
    document.documentElement.classList.toggle('root-filter');
  }

  changeLang(event: Event) {
    event.preventDefault();
    this.lang.toggleLang();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
