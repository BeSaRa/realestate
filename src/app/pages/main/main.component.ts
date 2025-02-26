import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { Component, HostListener, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ActionDirective, ActionsPortalComponent } from '@components/actions-portal/actions-portal.component';
import { ButtonComponent } from '@components/button/button.component';
import { ChatComponent } from '@components/chat/chat.component';
import { DataInfoComponent } from '@components/data-info/data-info.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
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
import { StickyService } from '@services/sticky.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { UserService } from '@services/user.service';
import { filter, map, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-main',
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
    SideBarComponent,
    ButtonComponent,
    BidiModule,
    ScrollToTopComponent,
    MatMenuModule,
    SliderMenuComponent,
    DataInfoComponent,
    ActionsPortalComponent,
    ActionDirective,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  lang = inject(TranslationService);
  stickyService = inject(StickyService);
  dialog = inject(DialogService);
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

  constructor() {
    registerLocaleData(localeAr, 'ar');
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
