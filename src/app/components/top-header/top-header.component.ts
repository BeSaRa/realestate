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
import { MatMenuModule, MenuPositionX } from '@angular/material/menu';
import { DialogService } from '@services/dialog.service';
import { LoginPopupComponent } from '@components/login-popup/login-popup.component';
import { CmsAuthenticationService } from '@services/auth.service';
import { UrlService } from '@services/url.service';
import { UsersService } from '@services/user.service';
import { UserInfo } from '@models/user-info';

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
  ],
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss'],
})
export class TopHeaderComponent implements OnInit, OnDestroy {
  search = new FormControl('', { nonNullable: true });
  authService = inject(CmsAuthenticationService);
  urlService = inject(UrlService)
  news: News[] = [];
  filteredNews: News[] = [];

  destroy$: Subject<void> = new Subject<void>();

  newsService = inject(NewsService);
  lang = inject(TranslationService);
  dialog = inject(DialogService);
  userService = inject(UsersService);
  isLtr: boolean = false;
  xPosition:MenuPositionX = 'before';
  userInfo?: UserInfo;

  recheckIfInMenu: boolean = false;

  ngOnInit(): void {
    this._listenToSearchChanges();
    this._listenToUserChange();
    this.onFocus(true);
    this.lang.change$.subscribe(x => {
      x.direction === 'ltr' ? this.xPosition = 'before' : 'after'});
    
  }

  private _listenToUserChange() {
    this.userService.currentUser.pipe(
      takeUntil(this.destroy$),
      debounceTime(200),
      tap((user) => {
        this.userInfo = user;
      })
    ).subscribe();
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
    this.dialog.open(LoginPopupComponent);

  }

  OnStaffLogin() {
    window.location.href = this.urlService.URLS.ADMIN;
  }
  onLogOut() {
    this.authService.logout().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
