import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule, registerLocaleData} from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { ChatGptComponent } from '@components/chat-gpt/chat-gpt.component';
import { FooterComponent } from '@components/footer/footer.component';
import { HeaderComponent } from '@components/header/header.component';
import { SideBarComponent } from '@components/side-bar/side-bar.component';
import { TranslationPopupComponent } from '@components/translation-popup/translation-popup.component';
import { SideBarDirection } from '@enums/side-bar-direction';
import { DialogService } from '@services/dialog.service';
import { SplashService } from '@services/splash.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import '@utils/prototypes/custom-prototypes';
import { map, startWith } from 'rxjs';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import {MatMenuModule} from '@angular/material/menu';
import { CmsAuthenticationService } from '@services/auth.service';
import { UrlService } from '@services/url.service';
import { UserInfo } from '@models/user-info';
import { UserService } from '@services/user.service';
import { Link } from '@models/link.model';
import { LinkService } from '@services/link.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatButtonModule,
    MatIconModule,
    ChatGptComponent,
    SideBarComponent,
    ButtonComponent,
    BidiModule,
    ScrollToTopComponent,
    MatMenuModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  lang = inject(TranslationService);
  stickyService = inject(StickyService);
  dialog = inject(DialogService);
  splashService = inject(SplashService);
  authService = inject(CmsAuthenticationService)
  urlService = inject(UrlService);
  userService = inject(UserService);
  linkService = inject(LinkService);
  userInfo?: UserInfo;
  isAuthenticated: boolean = false;

  direction$ = this.lang.change$.pipe(
    startWith(this.lang.isLtr ? SideBarDirection.RIGHT : SideBarDirection.LEFT),
    map(() => (this.lang.isLtr ? SideBarDirection.RIGHT : SideBarDirection.LEFT))
  );
  
  backtoTopFloat$ = this.lang.change$.pipe(
    startWith(this.lang.isLtr ? SideBarDirection.LEFT : SideBarDirection.RIGHT),
    map(() => (this.lang.isLtr ? SideBarDirection.LEFT : SideBarDirection.RIGHT))
  );

  private _listenToUserChange() {
    this.authService.currentUser.subscribe(userInfo =>{
      this.userInfo = userInfo;
    });
  }

  showBackToTopScroll: boolean = false;

  links: Link[] = [];

  constructor() {
    registerLocaleData(localeAr, 'ar');
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.splashService.removeSplash();
    }, 500);
    this.authService.loadUserFromLocalStorage();
    this._listenToUserChange();

    this.linkService.getLinks().subscribe((links) => {
      this.links = links;
    });

    this.authService.isLoggedIn().subscribe( authenticated =>
      this.isAuthenticated = authenticated
    )
    
  }

  @HostListener('window:scroll')
  windowScroll(): void {
    this.stickyService.isSticky.set(window.scrollY > 120);
    this.showBackToTopScroll = window.scrollY > 120;
  }
  @HostListener('window:keydown.control.alt.ش')
  @HostListener('window:keydown.control.alt.a')
  openTranslationPopup() {
    this.dialog.open(TranslationPopupComponent);
  }

  openLoginPopup() {
    this.userService.openLoginPopup();
  }

  OnStaffLogin() {
    this.userService.OnStaffLogin();
  }
  onScrollToTop(): void {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  logOut() {
    this.authService.logout();
    
  }
}
