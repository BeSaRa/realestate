import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { AfterViewInit, Component, HostListener, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { ChatGptComponent } from '@components/chat-gpt/chat-gpt.component';
import { DataInfoComponent } from '@components/data-info/data-info.component';
import { FooterComponent } from '@components/footer/footer.component';
import { HeaderComponent } from '@components/header/header.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { SideBarComponent } from '@components/side-bar/side-bar.component';
import { SliderMenuComponent } from '@components/slider-menu/slider-menu.component';
import { TranslationPopupComponent } from '@components/translation-popup/translation-popup.component';
import { SideBarDirection } from '@enums/side-bar-direction';
import { UserClick } from '@enums/user-click';
import { UserInfo } from '@models/user-info';
import { AuthService } from '@services/auth.service';
import { DataInfoService } from '@services/data-info.service';
import { DialogService } from '@services/dialog.service';
import { SplashService } from '@services/splash.service';
import { StickyService } from '@services/sticky.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { UserService } from '@services/user.service';
import '@utils/prototypes/custom-prototypes';
import { filter, map, startWith, switchMap } from 'rxjs';
import { SecurityService } from '@services/security.service';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    ExtraHeaderComponent,
    FooterComponent,
    MatButtonModule,
    MatIconModule,
    ChatGptComponent,
    SideBarComponent,
    ButtonComponent,
    BidiModule,
    ScrollToTopComponent,
    MatMenuModule,
    SliderMenuComponent,
    DataInfoComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  lang = inject(TranslationService);
  stickyService = inject(StickyService);
  dialog = inject(DialogService);
  splashService = inject(SplashService);
  urlService = inject(UrlService);
  userService = inject(UserService);
  toast = inject(ToastService);
  router = inject(Router);
  dataInfoService = inject(DataInfoService);
  authService = inject(AuthService);

  userInfo?: UserInfo;

  direction$ = this.lang.change$.pipe(
    startWith(this.lang.isLtr ? SideBarDirection.RIGHT : SideBarDirection.LEFT),
    map(() => (this.lang.isLtr ? SideBarDirection.RIGHT : SideBarDirection.LEFT))
  );

  private _listenToUserChange() {
    // this.authService.currentUser.subscribe((userInfo) => {
    //   this.userInfo = userInfo;
    // });
  }
  security = inject(SecurityService);
  constructor() {
    registerLocaleData(localeAr, 'ar');

    this.security.load().subscribe((sec) => {
      console.log(sec);
    });
  }

  ngOnInit(): void {
    this._listenToUserChange();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.splashService.removeSplash();
    }, 500);
  }

  @HostListener('window:scroll')
  windowScroll(): void {
    this.stickyService.isSticky.set(window.scrollY > 120);
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
}
