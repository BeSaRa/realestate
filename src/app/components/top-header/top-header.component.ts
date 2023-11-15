import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { NewsItemComponent } from '@components/news-item/news-item.component';
import { News } from '@models/news';
import { NewsService } from '@services/news.service';
import { TranslationService } from '@services/translation.service';
import { debounceTime, filter, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MatMenuModule, MenuPositionX } from '@angular/material/menu';
import { AuthService } from '@services/auth.service';
import { UrlService } from '@services/url.service';
import { UserInfo } from '@models/user-info';
import { UserService } from '@services/user.service';
import { DialogService } from '@services/dialog.service';
import { UserClick } from '@enums/user-click';
import { Router } from '@angular/router';
import { ToastService } from '@services/toast.service';
import { MatButtonModule } from '@angular/material/button';

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
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss'],
})
export class TopHeaderComponent implements OnInit, OnDestroy {
  search = new FormControl('', { nonNullable: true });
  authService = inject(AuthService);
  urlService = inject(UrlService);
  userService = inject(UserService);
  toast = inject(ToastService);
  dialog = inject(DialogService);
  router = inject(Router);

  news: News[] = [];
  filteredNews: News[] = [];

  destroy$: Subject<void> = new Subject<void>();

  newsService = inject(NewsService);
  lang = inject(TranslationService);
  isLtr = false;
  xPosition: MenuPositionX = 'before';

  ngOnInit(): void {
    this._listenToSearchChanges();
    this.onFocus(true);
    this.lang.change$.subscribe((x) => {
      x.direction === 'ltr' ? (this.xPosition = 'before') : 'after';
    });
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

  openLoginPopup() {
    this.userService.openLoginPopup();
  }

  onStaffLogin() {
    this.userService.onStuffLogin();
  }

  showUserPreference() {
    this.userService.openUserPreferencesPopup();
  }

  onLogOut() {
    this.dialog
      .confirm(this.lang.map.logout_confirmation, undefined, { no: this.lang.map.cancel, yes: this.lang.map.yes })
      .afterClosed()
      .pipe(
        filter((value) => value === UserClick.YES),
        switchMap(() => this.authService.logout())
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.logged_out_successfully, {
          verticalPosition: 'top',
          horizontalPosition: this.lang.isLtr ? 'left' : 'right',
        });
        this.router.navigate(['home']).then();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
