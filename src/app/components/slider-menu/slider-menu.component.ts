import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Menu } from '@models/menu';
import { RouterModule } from '@angular/router';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-slider-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './slider-menu.component.html',
  styleUrls: ['./slider-menu.component.scss'],
})
export class SliderMenuComponent extends OnDestroyMixin(class {}) implements OnInit {
  http = inject(HttpClient);
  urlService = inject(UrlService);
  lang = inject(TranslationService);
  sticky = inject(StickyService);
  menuService = inject(MenuService);

  mainMenu!: Menu;

  ngOnInit(): void {
    this.menuService.loadMenus().subscribe((menus) => (this.mainMenu = menus.main_menu));
  }
}
