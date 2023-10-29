import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ButtonComponent } from '@components/button/button.component';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Menu } from '@models/menu';
import { RouterModule } from '@angular/router';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ButtonComponent, RouterModule],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent extends OnDestroyMixin(class {}) implements OnInit {
  http = inject(HttpClient);
  urlService = inject(UrlService);
  lang = inject(TranslationService);
  sticky = inject(StickyService);
  menuService = inject(MenuService);

  mainMenu!: Menu;

  @Input() isAuthenticated = false;

  ngOnInit(): void {
    this.menuService.loadMenus().subscribe((menus) => (this.mainMenu = menus.main_menu));
  }
}
