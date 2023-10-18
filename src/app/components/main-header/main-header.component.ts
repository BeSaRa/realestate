import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { CmsAuthenticationService } from '@services/auth.service';
import { SideBarService } from '@services/side-bar.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import {MainMenuComponent} from '@components/main-menu/main-menu.component'

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, IconButtonComponent, MainMenuComponent],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent{

  lang = inject(TranslationService);
  sticky = inject(StickyService);
  authService = inject(CmsAuthenticationService)
  sideBarService = inject(SideBarService);
  @Input() isAuthenticated: boolean = false;

  changeLang(event: Event) {
    event.preventDefault();
    this.lang.toggleLang();
  }
}
